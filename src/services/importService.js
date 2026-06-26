const prisma = require('../config/prisma');

const processImport = async (moduleType, rows) => {
  let validRows = [];
  let errors = [];

  switch (moduleType) {
    case 'pallet-type':
      return await processPalletType(rows);
    case 'pallet':
      return await processPallet(rows);
    case 'factory':
      return await processFactory(rows);
    case 'destination':
      return await processDestination(rows);
    default:
      throw new Error(`Module ${moduleType} tidak didukung`);
  }
};

const addError = (errors, rowNumber, field, value, message) => {
  errors.push({
    row: rowNumber,
    field,
    value,
    message
  });
};

const processPalletType = async (rows) => {
  let validRows = [];
  let errors = [];
  
  // Pre-fetch for DB validation
  const existingTypes = await prisma.palletType.findMany({ select: { pallet_name: true } });
  const existingNames = new Set(existingTypes.map(t => t.pallet_name));
  const seenNames = new Set(); // untuk cek duplikat di dalam file

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // header baris 1
    let isValid = true;
    
    const { pallet_name, pallet_category } = row;

    if (!pallet_name) {
      addError(errors, rowNum, 'pallet_name', '', 'pallet_name wajib diisi');
      isValid = false;
    } else if (pallet_name.length > 50) {
      addError(errors, rowNum, 'pallet_name', pallet_name, 'pallet_name maksimal 50 karakter');
      isValid = false;
    } else {
      if (seenNames.has(pallet_name)) {
        addError(errors, rowNum, 'pallet_name', pallet_name, 'Terdapat duplikat pallet_name di dalam file ini');
        isValid = false;
      } else if (existingNames.has(pallet_name)) {
        addError(errors, rowNum, 'pallet_name', pallet_name, 'pallet_name sudah digunakan di database');
        isValid = false;
      } else {
        seenNames.add(pallet_name);
      }
    }

    if (!pallet_category) {
      addError(errors, rowNum, 'pallet_category', '', 'pallet_category wajib diisi');
      isValid = false;
    } else if (pallet_category.length > 50) {
      addError(errors, rowNum, 'pallet_category', pallet_category, 'pallet_category maksimal 50 karakter');
      isValid = false;
    }

    if (isValid) {
      validRows.push({ pallet_name, pallet_category });
    }
  }

  if (validRows.length > 0) {
    await prisma.palletType.createMany({
      data: validRows,
      skipDuplicates: true
    });
  }

  return {
    total_rows: rows.length,
    success_count: validRows.length,
    failed_count: errors.length,
    errors
  };
};

const processPallet = async (rows) => {
  let validRows = [];
  let errors = [];

  const existingPallets = await prisma.pallet.findMany({ select: { rfid_tag: true } });
  const existingRfids = new Set(existingPallets.map(p => p.rfid_tag));
  const seenRfids = new Set();

  const palletTypes = await prisma.palletType.findMany({ select: { id_pallet_type: true, pallet_name: true } });
  const palletTypeMap = new Map(palletTypes.map(pt => [pt.pallet_name, pt.id_pallet_type]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    let isValid = true;
    
    let { rfid_tag, pallet_type_name, location, status } = row;

    if (!rfid_tag) {
      addError(errors, rowNum, 'rfid_tag', '', 'rfid_tag wajib diisi');
      isValid = false;
    } else if (rfid_tag.length > 25) {
      addError(errors, rowNum, 'rfid_tag', rfid_tag, 'rfid_tag maksimal 25 karakter');
      isValid = false;
    } else {
      if (seenRfids.has(rfid_tag)) {
        addError(errors, rowNum, 'rfid_tag', rfid_tag, 'Terdapat duplikat rfid_tag di dalam file ini');
        isValid = false;
      } else if (existingRfids.has(rfid_tag)) {
        addError(errors, rowNum, 'rfid_tag', rfid_tag, 'rfid_tag sudah digunakan di database');
        isValid = false;
      } else {
        seenRfids.add(rfid_tag);
      }
    }

    let id_pallet_type = null;
    if (!pallet_type_name) {
      addError(errors, rowNum, 'pallet_type_name', '', 'pallet_type_name wajib diisi');
      isValid = false;
    } else {
      id_pallet_type = palletTypeMap.get(pallet_type_name);
      if (!id_pallet_type) {
        addError(errors, rowNum, 'pallet_type_name', pallet_type_name, 'Pallet Type tidak ditemukan');
        isValid = false;
      }
    }
    
    location = location || 'UNASSIGNED';
    
    status = status || 'AVAILABLE';
    if (!['AVAILABLE', 'SHIPPED'].includes(status.toUpperCase())) {
      addError(errors, rowNum, 'status', status, 'status hanya boleh AVAILABLE atau SHIPPED');
      isValid = false;
    } else {
      status = status.toUpperCase();
    }

    if (isValid) {
      validRows.push({
        rfid_tag,
        id_pallet_type,
        location,
        status
      });
    }
  }

  if (validRows.length > 0) {
    await prisma.pallet.createMany({
      data: validRows,
      skipDuplicates: true
    });
  }

  return {
    total_rows: rows.length,
    success_count: validRows.length,
    failed_count: errors.length,
    errors
  };
};

const processFactory = async (rows) => {
  let validRows = [];
  let errors = [];
  
  const existingFactories = await prisma.factory.findMany({ select: { factory_number: true } });
  const existingNumbers = new Set(existingFactories.map(f => f.factory_number));
  const seenNumbers = new Set();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    let isValid = true;
    
    const { factory_number, factory_name, factory_email, factory_address } = row;

    if (!factory_number) {
      addError(errors, rowNum, 'factory_number', '', 'factory_number wajib diisi');
      isValid = false;
    } else if (factory_number.length > 10) {
      addError(errors, rowNum, 'factory_number', factory_number, 'factory_number maksimal 10 karakter');
      isValid = false;
    } else {
      if (seenNumbers.has(factory_number)) {
        addError(errors, rowNum, 'factory_number', factory_number, 'Terdapat duplikat factory_number di dalam file ini');
        isValid = false;
      } else if (existingNumbers.has(factory_number)) {
        addError(errors, rowNum, 'factory_number', factory_number, 'factory_number sudah digunakan di database');
        isValid = false;
      } else {
        seenNumbers.add(factory_number);
      }
    }

    if (!factory_name) {
      addError(errors, rowNum, 'factory_name', '', 'factory_name wajib diisi');
      isValid = false;
    } else if (factory_name.length > 50) {
      addError(errors, rowNum, 'factory_name', factory_name, 'factory_name maksimal 50 karakter');
      isValid = false;
    }

    if (!factory_email) {
      addError(errors, rowNum, 'factory_email', '', 'factory_email wajib diisi');
      isValid = false;
    } else if (factory_email.length > 50) {
      addError(errors, rowNum, 'factory_email', factory_email, 'factory_email maksimal 50 karakter');
      isValid = false;
    } else if (!emailRegex.test(factory_email)) {
      addError(errors, rowNum, 'factory_email', factory_email, 'Format email tidak valid');
      isValid = false;
    }

    if (!factory_address) {
      addError(errors, rowNum, 'factory_address', '', 'factory_address wajib diisi');
      isValid = false;
    }

    if (isValid) {
      validRows.push({ factory_number, factory_name, factory_email, factory_address });
    }
  }

  if (validRows.length > 0) {
    await prisma.factory.createMany({
      data: validRows,
      skipDuplicates: true
    });
  }

  return {
    total_rows: rows.length,
    success_count: validRows.length,
    failed_count: errors.length,
    errors
  };
};

const processDestination = async (rows) => {
  let validRows = [];
  let errors = [];
  
  const existingDestinations = await prisma.destination.findMany({ select: { destination_number: true } });
  const existingNumbers = new Set(existingDestinations.map(d => d.destination_number));
  const seenNumbers = new Set();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    let isValid = true;
    
    const { destination_number, destination_name, destination_email, destination_address } = row;

    if (!destination_number) {
      addError(errors, rowNum, 'destination_number', '', 'destination_number wajib diisi');
      isValid = false;
    } else if (destination_number.length > 10) {
      addError(errors, rowNum, 'destination_number', destination_number, 'destination_number maksimal 10 karakter');
      isValid = false;
    } else {
      if (seenNumbers.has(destination_number)) {
        addError(errors, rowNum, 'destination_number', destination_number, 'Terdapat duplikat destination_number di dalam file ini');
        isValid = false;
      } else if (existingNumbers.has(destination_number)) {
        addError(errors, rowNum, 'destination_number', destination_number, 'destination_number sudah digunakan di database');
        isValid = false;
      } else {
        seenNumbers.add(destination_number);
      }
    }

    if (!destination_name) {
      addError(errors, rowNum, 'destination_name', '', 'destination_name wajib diisi');
      isValid = false;
    } else if (destination_name.length > 50) {
      addError(errors, rowNum, 'destination_name', destination_name, 'destination_name maksimal 50 karakter');
      isValid = false;
    }

    if (!destination_email) {
      addError(errors, rowNum, 'destination_email', '', 'destination_email wajib diisi');
      isValid = false;
    } else if (destination_email.length > 50) {
      addError(errors, rowNum, 'destination_email', destination_email, 'destination_email maksimal 50 karakter');
      isValid = false;
    } else if (!emailRegex.test(destination_email)) {
      addError(errors, rowNum, 'destination_email', destination_email, 'Format email tidak valid');
      isValid = false;
    }

    if (!destination_address) {
      addError(errors, rowNum, 'destination_address', '', 'destination_address wajib diisi');
      isValid = false;
    }

    if (isValid) {
      validRows.push({ destination_number, destination_name, destination_email, destination_address });
    }
  }

  if (validRows.length > 0) {
    await prisma.destination.createMany({
      data: validRows,
      skipDuplicates: true
    });
  }

  return {
    total_rows: rows.length,
    success_count: validRows.length,
    failed_count: errors.length,
    errors
  };
};

module.exports = {
  processImport
};
