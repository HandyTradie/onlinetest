import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { User } from '../models/User';
import { db } from '../firebase';

export const useCreateParticipantGroup = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      name,
      participants
    }: {
      name: string;
      participants: {
        name: string;
        email: string;
        phone: string;
      }[];
    }) => {
      const userID = User?.data?.uid;

      if (!userID) {
        throw new Error('Unauthorized');
      }

      const docRef = await addDoc(collection(db, 'participantGroups'), {
        owner: userID,
        name,
        participants
      });

      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['participantGroups']);
      }
    }
  );
};

export const useUpdateParticipantGroup = (groupID: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      name,
      participants
    }: {
      name: string;
      participants: {
        name: string;
        email: string;
        phone: string;
      }[];
    }) => {
      const userID = User?.data?.uid;

      if (!userID || !groupID) {
        throw new Error('Unauthorized');
      }

      await updateDoc(doc(db, 'participantGroups', groupID), {
        name,
        participants
      });
    },
    {
      onSuccess: () => {
        queryClient.refetchQueries(['participantGroups']);
      }
    }
  );
};

export const useCreatedParticipantGroups = () => {
  return useQuery(['participantGroups'], async () => {
    const q = query(collection(db, 'participantGroups'), where('owner', '==', User.data?.uid));

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return data as unknown as {
      id: string;
      name: string;
      owner: string;
      participants: {
        name: string;
        email: string;
        phone: string;
      }[];
    }[];
  });
};

export const useDeleteParticipantGroup = (participantGroupID: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async () => {
      const userID = User?.data?.uid;

      if (!userID) {
        throw new Error('Unauthorized');
      }

      await deleteDoc(doc(db, 'participantGroups', participantGroupID));
    },
    {
      onSuccess: () => {
        queryClient.setQueryData(['participantGroups'], (oldData: any) => {
          return oldData.filter(
            (participantGroup: any) => participantGroup.id !== participantGroupID
          );
        });
        queryClient.invalidateQueries(['participantGroups']);
      }
    }
  );
};
