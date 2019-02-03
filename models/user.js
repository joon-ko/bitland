const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name     : { type: String, default: "."},
    maxCount : { type: Number, default: 1 }
});

const Item = mongoose.model('Item', ItemSchema);

const InventorySpaceSchema = new Schema({
    item   : { type: ItemSchema },
    count  : { type: Number, default: 0 }
});

InventorySpace = mongoose.model('InventorySpace', InventorySpaceSchema);

let defaultInventory = [];
for (let i=0; i<10; i++) {
    defaultInventory.push(new InventorySpace({ item: new Item() }));
}

const UserSchema = new Schema({
    username  : { type: String, required: true, index: { unique: true } },
    password  : { type: String, required: true },
    x         : { type: Number, default: 1 },
    y         : { type: Number, default: 1 },
    inventory : { type: [InventorySpaceSchema], default: defaultInventory },
    world     : { type: String, default: 'tutorial' }
});

UserSchema.methods.verifyPassword = function(candidatePassword) {
    if (candidatePassword === this.password) return true;
    return false;
};

module.exports = mongoose.model('User', UserSchema);