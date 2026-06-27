require('dotenv').config();
const prisma = require('../src/config/prisma'); // Sesuaikan path jika berbeda
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Memulai proses seeding database WMS sesuai Master Data...');

  // ---------------------------------------------------------
  // 1. MASTER ROLE
  // ---------------------------------------------------------
  const rolesData = ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'BOD'];
  const roleMap = {}; // Untuk menyimpan ID dinamis yang dihasilkan DB

  for (const roleName of rolesData) {
    let role = await prisma.role.findFirst({ where: { nama_role: roleName } });
    if (!role) {
      // Biarkan DB yang membuatkan id_role secara otomatis
      role = await prisma.role.create({ data: { nama_role: roleName } });
    }
    roleMap[roleName] = role.id_role; // Simpan ID-nya untuk dipakai di tabel User
  }
  console.log('✅ Master Role berhasil di-seed');

  // ---------------------------------------------------------
  // 2. MASTER USER
  // ---------------------------------------------------------
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const usersData = [
    {
      nama: 'Super Admin',
      email: 'admin@wms.com',
      password: hashedPassword,
      id_role: roleMap['ADMIN'], // Ambil ID dinamis dari map di atas
    },
    {
      nama: 'OP 1',
      email: 'op1@wms.com',
      password: hashedPassword,
      id_role: roleMap['OPERATOR'],
    },
    {
      nama: 'User SUPERVISOR',
      email: 'supervisor@wms.com',
      password: hashedPassword,
      id_role: roleMap['SUPERVISOR'],
    },
    {
      nama: 'User BOD',
      email: 'bod@wms.com',
      password: hashedPassword,
      id_role: roleMap['BOD'],
    }
  ];

  for (const user of usersData) {
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existingUser) {
      await prisma.user.create({ data: user });
    }
  }
  console.log('✅ Master User berhasil di-seed');

  // ---------------------------------------------------------
  // 2B. MASTER MENU & ROLES_MENUS
  // ---------------------------------------------------------
  const menusData = [
    { nama_menu: 'Dashboard', path_key: 'dashboard' },
    { nama_menu: 'Inbound Plan', path_key: 'inbound-plan' },
    { nama_menu: 'Outbound Plan', path_key: 'outbound-plan' },
    { nama_menu: 'Work Order', path_key: 'work-order' },
    { nama_menu: 'Inventory', path_key: 'inventory' },
    { nama_menu: 'Master Data', path_key: 'master-data' }
  ];

  const menuMap = {}; // Untuk menyimpan ID menu yang dihasilkan
  for (const menu of menusData) {
    let existingMenu = await prisma.menu.findUnique({ where: { path_key: menu.path_key } });
    if (!existingMenu) {
      existingMenu = await prisma.menu.create({ data: menu });
    }
    menuMap[menu.path_key] = existingMenu.id_menu;
  }
  console.log('✅ Master Menu berhasil di-seed');

  // Relasi RoleMenu
  const roleMenuMapping = {
    'ADMIN': ['dashboard', 'inbound-plan', 'outbound-plan', 'work-order', 'inventory', 'master-data'],
    'SUPERVISOR': ['dashboard', 'inbound-plan', 'outbound-plan', 'inventory'],
    'OPERATOR': ['dashboard', 'work-order', 'inventory'],
    'BOD': ['dashboard', 'inventory']
  };

  for (const [roleName, menuKeys] of Object.entries(roleMenuMapping)) {
    const roleId = roleMap[roleName];
    for (const menuKey of menuKeys) {
      const menuId = menuMap[menuKey];
      // Cek apakah relasi sudah ada
      const existingRel = await prisma.roleMenu.findFirst({
        where: { id_role: roleId, id_menu: menuId }
      });
      if (!existingRel) {
        await prisma.roleMenu.create({
          data: { id_role: roleId, id_menu: menuId }
        });
      }
    }
  }
  console.log('✅ Relasi Roles_Menus berhasil di-seed');

  // ---------------------------------------------------------
  // 3. MASTER PALLET TYPE
  // ---------------------------------------------------------
  const palletTypesData = [
    { pallet_category: 'Standard', pallet_name: 'T1B' },
    { pallet_category: 'Standard', pallet_name: 'T1F' },
    { pallet_category: 'Module+Inner', pallet_name: 'T1X' },
    { pallet_category: 'EG', pallet_name: 'SP1' },
    { pallet_category: 'RR Box', pallet_name: 'SP2' },
  ];

  const ptMap = {};
  for (const pt of palletTypesData) {
    // Kita cari berdasarkan pallet_name
    let type = await prisma.palletType.findFirst({ where: { pallet_name: pt.pallet_name } });
    if (!type) {
      type = await prisma.palletType.create({ data: pt });
    }
    ptMap[pt.pallet_name] = type.id_pallet_type; // Simpan ID
  }
  console.log('✅ Master Pallet Type berhasil di-seed');

  // ---------------------------------------------------------
  // 4. MASTER FACTORY & DESTINATION
  // ---------------------------------------------------------
  let factory = await prisma.factory.findFirst({ where: { factory_number: 'F-001' } });
  if (!factory) {
    await prisma.factory.create({
      data: {
        factory_name: 'PT TKN',
        factory_number: 'F-001',
        factory_email: 'tkn@example.com',
        factory_address: 'Kawasan Industri Terpadu Indonesia China, Jl, KITIC, Kec. Serang Baru, Kabupaten Bekasi, Jawa Barat 17330',
      },
    });
  }

  let destination = await prisma.destination.findFirst({ where: { destination_number: 'D-001' } });
  if (!destination) {
    await prisma.destination.create({
      data: {
        destination_name: 'PT Toyota Motor Manufacturing Indonesia',
        destination_number: 'D-001',
        destination_email: 'tmmin@example.com',
        destination_address: 'Jalan Laksda Yos Sudarso Sunter 1, RT.2/RW.9, Sunter Jaya, Kec. Tj. Priok, Jkt Utara, Daerah Khusus Ibukota Jakarta 14350',
      },
    });
  }
  console.log('✅ Master Factory & Destination berhasil di-seed');

  // ---------------------------------------------------------
  // 5. MASTER WAREHOUSE AREA
  // ---------------------------------------------------------
  const areasData = [
    { warehouse_area_number: 'WH-AREA-001', warehouse_area_name: 'Transit Incoming Area' },
    { warehouse_area_number: 'WH-AREA-002', warehouse_area_name: 'Quarantine Area' },
    { warehouse_area_number: 'WH-AREA-003', warehouse_area_name: 'Central Store Area' },
    { warehouse_area_number: 'WH-AREA-004', warehouse_area_name: 'Delivery Area' },
  ];

  const areaMap = {};
  for (const area of areasData) {
    let existingArea = await prisma.warehouseArea.findFirst({ where: { warehouse_area_number: area.warehouse_area_number } });
    if (!existingArea) {
      existingArea = await prisma.warehouseArea.create({ data: area });
    }
    areaMap[area.warehouse_area_number] = existingArea.id_warehouse_area; // Simpan ID
  }
  console.log('✅ Master Warehouse Area berhasil di-seed');

  // ---------------------------------------------------------
  // 6. MASTER STORAGE BIN
  // ---------------------------------------------------------
  const binsData = [
    { id_warehouse_area: areaMap['WH-AREA-001'], bin_number: '001-01', max_quantity: 50, stock: 0 },
    { id_warehouse_area: areaMap['WH-AREA-001'], bin_number: '001-02', max_quantity: 50, stock: 0 },
    { id_warehouse_area: areaMap['WH-AREA-001'], bin_number: '001-03', max_quantity: 50, stock: 0 },
  ];

  for (const bin of binsData) {
    let existingBin = await prisma.storageBin.findFirst({ where: { bin_number: bin.bin_number } });
    if (!existingBin) {
      await prisma.storageBin.create({ data: bin });
    }
  }
  console.log('✅ Master Storage Bin berhasil di-seed');

  // ---------------------------------------------------------
  // 7. MASTER PALLET (Aset RFID)
  // ---------------------------------------------------------
  let pallet = await prisma.pallet.findUnique({ where: { rfid_tag: '300833B2DDD9014000000001' } });
  if (!pallet) {
    await prisma.pallet.createMany({
      data: [
        {
          id_pallet_type: ptMap['T1B'],
          rfid_tag: '300833B2DDD9014000000001',
          location: 'WH-AREA-001',
          status: 'AVAILABLE'
        },
        {
          id_pallet_type: ptMap['T1F'],
          rfid_tag: '300833B2DDD9014000000002',
          location: 'WH-AREA-001',
          status: 'AVAILABLE'
        },
        {
          id_pallet_type: ptMap['T1X'],
          rfid_tag: '300833B2DDD9014000000003',
          location: 'WH-AREA-001',
          status: 'AVAILABLE'
        },
        {
          id_pallet_type: ptMap['T1B'],
          rfid_tag: '300833B2DDD9014000000004',
          location: 'WH-AREA-001',
          status: 'AVAILABLE'
        }
      ],
      skipDuplicates: true
    });
  }
  console.log('✅ Master Pallet (RFID) berhasil di-seed');

  console.log('🎉 Seeding Selesai! Seluruh data Master sukses diinput ke PostgreSQL secara aman.');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi Error saat Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });