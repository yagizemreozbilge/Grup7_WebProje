// USER (Oyuncu) rolüne rezervasyon yetkilerini verme scripti
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('../config');
const Roles = require('../db/models/Roles');
const RolePrivileges = require('../db/models/RolePrivileges');
const Database = require('../db/Database');

async function setupUserPermissions() {
  try {
    // MongoDB'ye bağlan
    const db = new Database();
    await db.connect({ CONNECTION_STRING: config.CONNECTION_STRING });

    // USER rolünü bul
    const userRole = await Roles.findOne({ role_name: 'USER' });
    
    if (!userRole) {
      console.error('❌ USER rolü bulunamadı! Önce create-default-role.js scriptini çalıştırın.');
      process.exit(1);
    }

    console.log('✅ USER rolü bulundu:', userRole.role_name);

    // USER rolüne verilecek yetkiler (Rezervasyon yapma için)
    const userPermissions = [
      'fields_view',           // Sahaları görüntüleme
      'reservations_view',     // Kendi rezervasyonlarını görüntüleme
      'reservations_add',      // Rezervasyon yapma
      'reservations_update',   // Kendi rezervasyonlarını güncelleme
      'reservations_delete',   // Kendi rezervasyonlarını iptal etme
      'availabilities_view'    // Müsaitlikleri görüntüleme
    ];

    // Mevcut USER yetkilerini kontrol et
    const existingPermissions = await RolePrivileges.find({ role_id: userRole._id });
    console.log(`ℹ️ Mevcut USER yetkileri: ${existingPermissions.length} adet`);

    // Yetkileri ekle
    let addedCount = 0;
    for (const permission of userPermissions) {
      const exists = await RolePrivileges.findOne({ 
        role_id: userRole._id, 
        permission: permission 
      });

      if (!exists) {
        try {
          await RolePrivileges.create({
            role_id: userRole._id,
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
      console.log('ℹ️ USER rolü zaten tüm gerekli yetkilere sahip!');
    } else {
      console.log(`\n✅ ${addedCount} yeni yetki USER rolüne eklendi!`);
    }

    // Son durumu göster
    const finalPermissions = await RolePrivileges.find({ role_id: userRole._id });
    console.log(`\n📊 USER rolünün toplam yetki sayısı: ${finalPermissions.length}`);
    console.log('\n✅ USER (Oyuncu) rolü artık rezervasyon yetkilerine sahip!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

setupUserPermissions();

