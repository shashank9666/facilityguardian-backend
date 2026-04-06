import { Schema, model, Document } from "mongoose";

export interface IVendor extends Document {
  name: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive" | "blacklisted";
  rating: number;
  contractStart: Date;
  contractEnd: Date;
  slaHours: number;
  totalOrders: number;
  completedOnTime: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    name:            { type: String, required: true, trim: true, maxlength: 200 },
    category:        { type: String, required: true, trim: true },
    contactName:     { type: String, trim: true, default: "" },
    email:           { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
    phone:           { type: String, trim: true, default: "" },
    address:         { type: String, trim: true, default: "" },
    status:          { type: String, enum: ["active","inactive","blacklisted"], default: "active" },
    rating:          { type: Number, min: 0, max: 5, default: 0 },
    contractStart:   { type: Date },
    contractEnd:     { type: Date },
    slaHours:        { type: Number, min: 0, default: 24 },
    totalOrders:     { type: Number, min: 0, default: 0 },
    completedOnTime: { type: Number, min: 0, default: 0 },
    notes:           { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const Vendor = model<IVendor>("Vendor", VendorSchema);
