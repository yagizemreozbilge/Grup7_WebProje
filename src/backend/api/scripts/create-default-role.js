// Varsayılan rol oluşturma scripti
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('../config');
const Roles = require('../db/models/Roles');
const Database = require('../db/Database');

async function createDefaultRole() {
  try {
    // MongoDB'ye bağlan
    const db = new Database();
    await db.connect({ CONNECTION_STRING: config.CONNECTION_STRING });

    // "USER" rolünün var olup olmadığını kontrol et
    let userRole = await Roles.findOne({ role_name: 'USER' });
    
    if (!userRole) {
      // Varsayılan USER rolünü oluştur
      userRole = await Roles.create({
        role_name: 'USER',
        is_active: true
      });
      console.log('✅ USER rolü oluşturuldu:', userRole);
    } else {
      console.log('ℹ️ USER rolü zaten mevcut:', userRole);
    }

    // "CUSTOMER" rolünün var olup olmadığını kontrol et
    let customerRole = await Roles.findOne({ role_name: 'CUSTOMER' });
    
    if (!customerRole) {
      // Varsayılan CUSTOMER rolünü oluştur
      customerRole = await Roles.create({
        role_name: 'CUSTOMER',
        is_active: true
      });
      console.log('✅ CUSTOMER rolü oluşturuldu:', customerRole);
    } else {
      console.log('ℹ️ CUSTOMER rolü zaten mevcut:', customerRole);
    }

    // "ADMIN" rolünün var olup olmadığını kontrol et
    let adminRole = await Roles.findOne({ role_name: 'ADMIN' });
    
    if (!adminRole) {
      // Varsayılan ADMIN rolünü oluştur
      adminRole = await Roles.create({
        role_name: 'ADMIN',
        is_active: true
      });
      console.log('✅ ADMIN rolü oluşturuldu:', adminRole);
    } else {
      console.log('ℹ️ ADMIN rolü zaten mevcut:', adminRole);
    }

    console.log('\n✅ Varsayılan roller hazır! (USER, CUSTOMER, ADMIN)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

createDefaultRole();

