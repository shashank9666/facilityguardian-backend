import { Schema, model, Document, Types } from "mongoose";

export interface IAsset extends Omit<Document, "model"> {
  code: string;
  name: string;
  category: string;
  status: "operational" | "maintenance" | "faulty" | "decommissioned";
  location: string;
  floor: string;
  building: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: Date;
  warrantyExpiry: Date;
  lastMaintenance: Date;
  nextMaintenance: Date;
  value: number;
  assignedTo?: Types.ObjectId;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
    name:           { type: String, required: true, trim: true, maxlength: 200 },
    category:       { type: String, required: true, enum: ["HVAC","Electrical","Plumbing","Elevator","Fire Safety","IT","Furniture","Vehicle","Other"] },
    status:         { type: String, required: true, enum: ["operational","maintenance","faulty","decommissioned"], default: "operational" },
    location:       { type: String, required: true, trim: true },
    floor:          { type: String, trim: true, default: "" },
    building:       { type: String, trim: true, default: "" },
    serialNumber:   { type: String, trim: true, default: "" },
    manufacturer:   { type: String, trim: true, default: "" },
    model:          { type: String, trim: true, default: "" },
    purchaseDate:   { type: Date },
    warrantyExpiry: { type: Date },
    lastMaintenance:{ type: Date },
    nextMaintenance:{ type: Date },
    value:          { type: Number, min: 0, default: 0 },
    assignedTo:     { type: Schema.Types.ObjectId, ref: "User" },
    notes:          { type: String, trim: true, default: "" },
    tags:           [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Auto-generate code if missing
AssetSchema.pre("validate", function (next) {
  if (!this.code) {
    this.code = `AST-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  next();
});

AssetSchema.index({ name: "text", code: "text", location: "text" });

AssetSchema.index({ status: 1, category: 1 });

export const Asset = model<IAsset>("Asset", AssetSchema);
