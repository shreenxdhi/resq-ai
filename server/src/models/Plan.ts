import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  userId: string;
  country: string;
  city: string;
  disaster: string;
  tips: string[];
  createdAt: Date;
}

const PlanSchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  country: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  disaster: { 
    type: String, 
    required: true 
  },
  tips: { 
    type: [String], 
    default: [] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IPlan>('Plan', PlanSchema); 