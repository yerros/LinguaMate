export type User = {
    $id?: String,
    clerkId: String,
    email?: String,
    fullName?: String,
    subscriptionTier?: String,
    isPremium: Boolean,
    totalConversations: Number,
    totalCharactersUsed: Number,
    totalMinutesUsed: Number,
    $createdAt: Date,
    $updatedAt: Date,
}