// CUSTOMER (Saha Sahibi) rolüne saha yönetimi yetkilerini verme scripti
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('../config');
const Roles = require('../db/models/Roles');
const RolePrivileges = require('../db/models/RolePrivileges');
const Database = require('../db/Database');
const role_privileges = require('../config/role_privileges');

async function setupCustomerPermissions() {
  try {
    // MongoDB'ye bağlan
    const db = new Database();
    await db.connect({ CONNECTION_STRING: config.CONNECTION_STRING });

    // CUSTOMER rolünü bul
    const customerRole = await Roles.findOne({ role_name: 'CUSTOMER' });
    
    if (!customerRole) {
      console.error('❌ CUSTOMER rolü bulunamadı! Önce create-default-role.js scriptini çalıştırın.');
      process.exit(1);
    }

    console.log('✅ CUSTOMER rolü bulundu:', customerRole.role_name);

    // CUSTOMER rolüne verilecek yetkiler (Saha yönetimi için)
    const customerPermissions = [
      'fields_view',    // Sahaları görüntüleme
      'fields_add',     // Saha ekleme
      'fields_update',  // Saha güncelleme
      'fields_delete',  // Saha silme
      'reservations_view',    // Rezervasyonları görüntüleme
      'reservations_add',     // Rezervasyon ekleme
      'reservations_update', // Rezervasyon güncelleme
      'reservations_delete',  // Rezervasyon silme
      'availabilities_view',  // Müsaitlikleri görüntüleme
      'availabilities_add',   // Müsaitlik ekleme
      'availabilities_update',// Müsaitlik güncelleme
      'availabilities_delete' // Müsaitlik silme
    ];

    // Mevcut CUSTOMER yetkilerini kontrol et
    const existingPermissions = await RolePrivileges.find({ role_id: customerRole._id });
    console.log(`ℹ️ Mevcut CUSTOMER yetkileri: ${existingPermissions.length} adet`);

    // Yetkileri ekle
    let addedCount = 0;
    for (const permission of customerPermissions) {
      const exists = await RolePrivileges.findOne({ 
        role_id: customerRole._id, 
        permission: permission 
      });

      if (!exists) {
        try {
          await RolePrivileges.create({
            role_id: customerRole._id,
            permission: permission,
            created_by: null // Sistem tarafından oluşturuldu
          });
          addedCount++;
          console.log(`  ✅ Yetki eklendi: ${permission}`);
        } catch (err) {
          if (err.code !== 11000) {
            console.error(`  ❌ Yetki eklenirken hata: ${permission}`, err.message);
          }
        }
      } else {
        console.log(`  ℹ️ Yetki zaten mevcut: ${permission}`);
      }
    }

    if (addedCount === 0) {
      console.log('ℹ️ CUSTOMER rolü zaten tüm gerekli yetkilere sahip!');
    } else {
      console.log(`\n✅ ${addedCount} yeni yetki CUSTOMER rolüne eklendi!`);
    }

    // Son durumu göster
    const finalPermissions = await RolePrivileges.find({ role_id: customerRole._id });
    console.log(`\n📊 CUSTOMER rolünün toplam yetki sayısı: ${finalPermissions.length}`);
    console.log('\n✅ CUSTOMER (Saha Sahibi) rolü artık saha yönetimi yetkilerine sahip!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

setupCustomerPermissions();

