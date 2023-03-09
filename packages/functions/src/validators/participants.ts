import { z } from 'zod';

export const addParticipantsToTestSchema = z.object({
  participants: z.array(
    z.object({
      email: z.string(),
      name: z.string(),
      phone: z.string()
    })
  ),
  sendEmails: z.boolean()
});

export type AddParticipantsToTestSchema = z.infer<typeof addParticipantsToTestSchema>;

export const resendParticipantInviteSchema = z.object({
  testID: z.string(),
  participantIDs: z.string().array()
});

export type ResendParticipantInviteSchema = z.infer<typeof resendParticipantInviteSchema>;

export const sendParticipantResultsSchema = z.object({
  testID: z.string(),
  participantIDs: z.string().array()
});

export type SendParticipantResultsSchema = z.infer<typeof sendParticipantResultsSchema>;
