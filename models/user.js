const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name     : { type: String, default: "."},
    attack   : { type: Number, default: 0 },
    strength : { type: Number, default: 0 },
    maxCount : { type: Number, default: 1 }
});

const Item = mongoose.model('Item', ItemSchema);

const InventorySpaceSchema = new Schema({
    filled : { type: Boolean, default: false },
    item   : { type: ItemSchema, default: new Item() },
    count  : { type: Number, default: 0 }
});

InventorySpace = mongoose.model('InventorySpace', InventorySpaceSchema);

let defaultInventory = [];
for (let i=0; i<10; i++) {
    defaultInventory.push(new InventorySpace());
}

const UserSchema = new Schema({
    username  : { type: String, required: true, index: { unique: true } },
    password  : { type: String, required: true },
    x         : { type: Number, default: 1 },
    y         : { type: Number, default: 1 },
    inventory : { type: [InventorySpaceSchema], default: defaultInventory }
});

UserSchema.methods.verifyPassword = function(candidatePassword) {
    if (candidatePassword === this.password) return true;
    return false;
};

module.exports = mongoose.model('User', UserSchema);