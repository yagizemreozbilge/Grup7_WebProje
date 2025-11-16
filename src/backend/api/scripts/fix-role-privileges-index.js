// RolePrivileges unique index'ini kaldırma scripti
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('../config');
const Database = require('../db/Database');

async function fixIndex() {
  try {
    // MongoDB'ye bağlan
    const db = new Database();
    await db.connect({ CONNECTION_STRING: config.CONNECTION_STRING });

    const dbConnection = mongoose.connection.db;
    const collection = dbConnection.collection('role_privileges');

    // Mevcut index'leri listele
    const indexes = await collection.indexes();
    console.log('Mevcut index\'ler:', indexes);

    // role_id unique index'ini kaldır
    try {
      await collection.dropIndex('role_id_1');
      console.log('✅ role_id unique index kaldırıldı');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️ role_id index zaten yok');
      } else {
        throw err;
      }
    }

    // role_id ve permission için compound unique index oluştur (bir rol aynı yetkiyi iki kez alamaz)
    try {
      await collection.createIndex({ role_id: 1, permission: 1 }, { unique: true });
      console.log('✅ role_id + permission compound unique index oluşturuldu');
    } catch (err) {
      console.log('ℹ️ Index zaten mevcut veya oluşturulamadı:', err.message);
    }

    console.log('\n✅ Index düzeltmeleri tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

fixIndex();

