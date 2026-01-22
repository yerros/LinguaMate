import { tablesDB } from "@/lib/appwrite";
import { User } from "@/types/userType";
import { Query } from "appwrite";

// Type for Clerk User (based on properties used)
interface ClerkUserData {
    id: string;
    emailAddresses: Array<{ emailAddress: string }>;
    fullName: string | null;
}

/**
 * Create a new user in Appwrite
 */
export async function createUserAppwrite(user: User) {
    console.log('[USER SERVICE] Creating new user:', {
        clerkId: user.clerkId,
        email: user.email,
        fullName: user.fullName,
    });

    try {
        const newUser = await tablesDB.createRow({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'user',
            rowId: crypto.randomUUID(),
            data: {
                clerkId: user.clerkId,
                email: user.email,
                fullName: user.fullName,
                subscriptionTier: user.subscriptionTier,
                isPremium: user.isPremium,
                totalConversations: user.totalConversations,
                totalCharactersUsed: user.totalCharactersUsed,
                totalMinutesUsed: user.totalMinutesUsed,
            }
        });

        console.log('[USER SERVICE] ✅ User created successfully:', {
            userId: newUser.$id,
            clerkId: user.clerkId,
        });

        return newUser;
    } catch (error) {
        console.error('[USER SERVICE] ❌ Error creating user:', error);
        throw error;
    }
}

/**
 * Update user data in Appwrite based on Clerk data
 */
export async function updateUserAppwrite(
    rowId: string,
    clerkUser: ClerkUserData | null
): Promise<any> {
    if (!clerkUser) {
        throw new Error('Clerk user data is required');
    }

    console.log('[USER SERVICE] Updating user:', {
        rowId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        fullName: clerkUser.fullName,
    });

    const updateData: Partial<User> = {
        email: clerkUser.emailAddresses[0]?.emailAddress || undefined,
        fullName: clerkUser.fullName || undefined,
        $updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
        }
    });

    try {
        const updated = await tablesDB.updateRow({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'user',
            rowId: rowId,
            data: updateData as any,
        });

        console.log('[USER SERVICE] ✅ User updated successfully:', {
            userId: updated.$id,
        });

        return updated;
    } catch (error) {
        console.error('[USER SERVICE] ❌ Error updating user:', error);
        throw error;
    }
}

/**
 * Get or create user in Appwrite
 * Optimization: using limit 1 for more efficient query
 */
export async function getUserAppwrite(
    clerkId: string,
    clerkUser?: ClerkUserData | null
): Promise<any> {
    console.log('[USER SERVICE] Getting user by clerkId:', clerkId);

    try {
        // Optimized query with limit 1
        const userResult = await tablesDB.listRows({
            databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: 'user',
            queries: [
                Query.equal('clerkId', clerkId),
                Query.limit(1) // Optimization: only fetch 1 result
            ]
        });

        console.log('[USER SERVICE] Query result:', {
            total: userResult.total,
            found: userResult.total > 0,
        });

        // If user already exists
        if (userResult.total > 0) {
            const existingUser = userResult.rows[0];
            console.log('[USER SERVICE] ✅ User found:', {
                userId: existingUser.$id,
                email: existingUser.email,
            });

            // Sync data from Clerk if there are changes
            if (clerkUser) {
                const needsUpdate =
                    existingUser.email !== clerkUser.emailAddresses[0]?.emailAddress ||
                    existingUser.fullName !== clerkUser.fullName;

                if (needsUpdate) {
                    console.log('[USER SERVICE] User data needs update, syncing...');
                    try {
                        return await updateUserAppwrite(existingUser.$id, clerkUser);
                    } catch (error) {
                        console.error('[USER SERVICE] ❌ Error updating user:', error);
                        // Return existing user if update fails
                        return existingUser;
                    }
                } else {
                    console.log('[USER SERVICE] User data is up to date');
                }
            }

            return existingUser;
        }

        // If user doesn't exist, create new one
        console.log('[USER SERVICE] User not found, creating new user...');
        if (!clerkUser) {
            throw new Error('Clerk user data is required to create new user');
        }

        const newUserData: User = {
            clerkId: clerkId,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            fullName: clerkUser.fullName || undefined,
            subscriptionTier: 'free',
            isPremium: false,
            totalConversations: 0,
            totalCharactersUsed: 0,
            totalMinutesUsed: 0,
            $createdAt: new Date(),
            $updatedAt: new Date(),
        };

        return await createUserAppwrite(newUserData);
    } catch (error) {
        console.error('[USER SERVICE] ❌ Error in getUserAppwrite:', error);
        throw error;
    }
}