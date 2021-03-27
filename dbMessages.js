import mongoose from 'mongoose';

const whatsappSchema=mongoose.Schema({
    message:String,
    name:String,
    timeStamp:String,
    received: Boolean
});

export default mongoose.model('messagecontents', whatsappSchema);