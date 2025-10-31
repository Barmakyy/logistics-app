import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    // We'll use a single document to store all settings
    singleton: { type: String, default: 'main', unique: true },

    // Company Info
    companyName: { type: String, default: 'BongoExpress' },
    companyEmail: { type: String, default: 'info@bongoexpress.com' },
    companyPhone: { type: String, default: '+254 711 111 111' },
    address: { type: String, default: '123 Logistics Lane, Nairobi' },
    website: { type: String, default: 'https://bongoexpress.com' },
    socialLinks: {
      facebook: String,
      whatsapp: String,
      instagram: String,
      linkedin: String,
    },
    logo: { type: String, default: '' },

    // Notification Settings
    notifications: {
      emailAlertsNewShipments: { type: Boolean, default: true },
      emailAlertsNewMessages: { type: Boolean, default: false },
      emailAlertsPaymentConfirmations: { type: Boolean, default: true },
      whatsappNotifications: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;