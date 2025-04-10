"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Center, Spinner, Text } from '@chakra-ui/react';
import AdminLayout from '../../components/admin/AdminLayout';

/**
 * Content Moderation Page
 * 
 * This page serves as an alias for the /admin/moderation page
 * to maintain backward compatibility with any existing links or bookmarks.
 */
export default function ContentModerationPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the actual moderation page
    router.replace('/admin/moderation');
  }, [router]);
  
  return (
    <AdminLayout title="Content Moderation">
      <Center h="80vh" flexDirection="column">
        <Spinner size="xl" mb={4} color="blue.500" thickness="4px" speed="0.65s" />
        <Text fontSize="lg">Redirecting to moderation dashboard...</Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          The content moderation page is now at /admin/moderation
        </Text>
      </Center>
    </AdminLayout>
  );
}
