const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    permissions: [{
        type: String
    }]
});

module.exports = mongoose.model('Roles', RoleSchema);
