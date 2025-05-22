const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add indexes for better query performance
chatMessageSchema.index({ sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ userId: 1, sessionId: 1 });

// Add a method to get recent chat history
chatMessageSchema.statics.getRecentMessages = function(sessionId, limit = 10) {
    return this.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
};

// Add a method to create a new message
chatMessageSchema.statics.createMessage = async function(messageData) {
    try {
        const message = new this(messageData);
        return await message.save();
    } catch (error) {
        throw new Error(`Error creating message: ${error.message}`);
    }
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;