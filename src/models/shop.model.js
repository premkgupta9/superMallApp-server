import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true  
    },
    owner :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
}, {timestamps: true})


export const Shop = mongoose.model("Shop", shopSchema)