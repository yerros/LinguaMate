import { getUserAppwrite } from "@/services/user";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useAuth = () => {
    const { user, isLoaded } = useUser();
    const queryClient = useQueryClient();

    // Query to get user from Appwrite with auto-sync
    const {
        data: userAppwrite,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['user', user?.id],
        queryFn: async () => {
            if (!user || !isLoaded) return null;
            return await getUserAppwrite(user.id, user);
        },
        enabled: !!user && isLoaded,
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - cache time
    });

    // Auto-sync when Clerk data changes
    useEffect(() => {
        if (!user || !isLoaded || !userAppwrite) return;

        // Check if there are changes in Clerk that need to be synced
        const needsSync =
            userAppwrite.email !== user.emailAddresses[0]?.emailAddress ||
            userAppwrite.fullName !== user.fullName;

        if (needsSync) {
            // Invalidate and refetch to trigger sync
            queryClient.invalidateQueries({ queryKey: ['user', user.id] });
        }
    }, [
        user?.emailAddresses,
        user?.fullName,
        userAppwrite,
        isLoaded,
        queryClient,
        user?.id
    ]);

    return {
        user: userAppwrite,
        isLoading: isLoading || !isLoaded,
        error,
        refetch,
        getUser: async () => {
            if (!user) return null;
            return await getUserAppwrite(user.id, user);
        }
    };
}