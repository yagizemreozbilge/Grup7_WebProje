// ADMIN rolüne tüm yetkileri verme scripti
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('../config');
const Roles = require('../db/models/Roles');
const RolePrivileges = require('../db/models/RolePrivileges');
const Database = require('../db/Database');
const role_privileges = require('../config/role_privileges');

async function setupAdminPermissions() {
  try {
    // MongoDB'ye bağlan
    const db = new Database();
    await db.connect({ CONNECTION_STRING: config.CONNECTION_STRING });

    // ADMIN rolünü bul
    const adminRole = await Roles.findOne({ role_name: 'ADMIN' });
    
    if (!adminRole) {
      console.error('❌ ADMIN rolü bulunamadı! Önce create-default-role.js scriptini çalıştırın.');
      process.exit(1);
    }

    console.log('✅ ADMIN rolü bulundu:', adminRole.role_name);

    // Mevcut ADMIN yetkilerini kontrol et
    const existingPermissions = await RolePrivileges.find({ role_id: adminRole._id });
    console.log(`ℹ️ Mevcut ADMIN yetkileri: ${existingPermissions.length} adet`);

    // Tüm yetkileri al
    const allPermissions = role_privileges.privileges.map(p => p.key);
    console.log(`📋 Toplam yetki sayısı: ${allPermissions.length}`);

    // Eksik yetkileri ekle
    let addedCount = 0;
    for (const permission of allPermissions) {
      const exists = await RolePrivileges.findOne({ 
        role_id: adminRole._id, 
        permission: permission 
      });

      if (!exists) {
        try {
          await RolePrivileges.create({
            role_id: adminRole._id,
            permission: permission,
            created_by: null // Sistem tarafından oluşturuldu
          });
          addedCount++;
          console.log(`  ✅ Yetki eklendi: ${permission}`);
        } catch (err) {
          // Duplicate key hatası olabilir, görmezden gel
          if (err.code !== 11000) {
            console.error(`  ❌ Yetki eklenirken hata: ${permission}`, err.message);
          }
        }
      } else {
        console.log(`  ℹ️ Yetki zaten mevcut: ${permission}`);
      }
    }

    if (addedCount === 0) {
      console.log('ℹ️ ADMIN rolü zaten tüm yetkilere sahip!');
    } else {
      console.log(`\n✅ ${addedCount} yeni yetki ADMIN rolüne eklendi!`);
    }

    // Son durumu göster
    const finalPermissions = await RolePrivileges.find({ role_id: adminRole._id });
    console.log(`\n📊 ADMIN rolünün toplam yetki sayısı: ${finalPermissions.length}`);
    console.log('\n✅ ADMIN rolü artık tüm yetkilere sahip!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

setupAdminPermissions();

