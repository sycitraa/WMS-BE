require('dotenv').config(); 

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({ adapter });

const softDeleteModels = [
  'User', 'Factory', 'Destination', 'PalletType', 
  'WarehouseArea', 'StorageBin', 'Pallet', 
  'InboundPlan', 'OutboundPlan', 'WorkOrder'
];

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          args.where = { deleted_at: null, ...args.where };
        }
        return query(args);
      },
      async findFirst({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          args.where = { deleted_at: null, ...args.where };
        }
        return query(args);
      },
      async findUnique({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          return basePrisma[model].findFirst({
            ...args,
            where: { deleted_at: null, ...args.where },
          });
        }
        return query(args);
      },
      async findUniqueOrThrow({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          return basePrisma[model].findFirstOrThrow({
            ...args,
            where: { deleted_at: null, ...args.where },
          });
        }
        return query(args);
      },
      async count({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          args.where = { deleted_at: null, ...args.where };
        }
        return query(args);
      },
      async delete({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          return basePrisma[model].update({
            ...args,
            data: { deleted_at: new Date() },
          });
        }
        return query(args);
      },
      async deleteMany({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          return basePrisma[model].updateMany({
            ...args,
            data: { deleted_at: new Date() },
          });
        }
        return query(args);
      }
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
module.exports.basePrisma = basePrisma;