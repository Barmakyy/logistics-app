import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'],
      default: 'Pending',
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    weight: {
      type: Number,
    },
    packageDetails: {
      type: String,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true },
);

shipmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.shipmentId) {
    this.shipmentId = `SHP${nanoid()}`;
  }
  next();
});

const Shipment = mongoose.model('Shipment', shipmentSchema);
export default Shipment;