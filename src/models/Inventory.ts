import { Schema, model, Document, Types } from "mongoose";

export interface IInventory extends Document {
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  location: string;
  supplierId?: Types.ObjectId;
  supplierName?: string;
  unitCost: number;
  lastRestocked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
    name:         { type: String, required: true, trim: true, maxlength: 200 },
    category:     { type: String, trim: true, default: "General" },
    unit:         { type: String, trim: true, default: "Pcs" },
    quantity:     { type: Number, min: 0, default: 0 },
    minQuantity:  { type: Number, min: 0, default: 0 },
    maxQuantity:  { type: Number, min: 0, default: 100 },
    status:       { type: String, enum: ["in_stock","low_stock","out_of_stock"], default: "in_stock" },
    location:     { type: String, trim: true, default: "" },
    supplierId:   { type: Schema.Types.ObjectId, ref: "Vendor" },
    supplierName: { type: String, trim: true },
    unitCost:     { type: Number, min: 0, default: 0 },
    lastRestocked:{ type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-compute status before save
InventorySchema.pre("save", function (next) {
  if (this.quantity <= 0) this.status = "out_of_stock";
  else if (this.quantity <= this.minQuantity) this.status = "low_stock";
  else this.status = "in_stock";
  next();
});

export const Inventory = model<IInventory>("Inventory", InventorySchema);
