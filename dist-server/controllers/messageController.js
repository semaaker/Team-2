import { z } from 'zod';
import { db } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { makeId, matches } from '../utils/helpers.js';
export const sendMessageSchema = z.object({
    body: z
        .string()
        .trim()
        .min(1, 'Mesaj boş olamaz.')
        .max(4000, 'Mesaj en fazla 4000 karakter olabilir.'),
});
export const messageController = {
    /** Konuşma listesi (arama destekli, en yeni önce). */
    conversations(req, res) {
        const search = String(req.query.search ?? '').trim();
        let results = [...db.conversations];
        if (search) {
            results = results.filter((conversation) => matches(conversation.participantName, search) ||
                matches(conversation.lastMessage, search));
        }
        results.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        res.json(results);
    },
    /** Bir konuşmanın mesajları. */
    messages(req, res) {
        const conversation = db.conversations.find((item) => item.id === req.params.id);
        if (!conversation)
            throw ApiError.notFound('Konuşma bulunamadı.');
        const messages = db.messages
            .filter((message) => message.conversationId === conversation.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((message) => ({ ...message, isMine: message.senderId === req.user?.id }));
        res.json(messages);
    },
    /** Yeni mesaj gönderir ve konuşma önizlemesini günceller. */
    send(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        const conversation = db.conversations.find((item) => item.id === req.params.id);
        if (!conversation)
            throw ApiError.notFound('Konuşma bulunamadı.');
        const { body } = req.body;
        const now = new Date().toISOString();
        const message = {
            id: makeId('msg'),
            conversationId: conversation.id,
            body,
            createdAt: now,
            senderId: req.user.id,
            senderName: req.user.fullName,
        };
        db.messages.push(message);
        conversation.lastMessage = body;
        conversation.lastMessageAt = now;
        conversation.unreadCount = 0;
        res.status(201).json({ ...message, isMine: true });
    },
    /** Konuşmayı okundu olarak işaretler. */
    markRead(req, res) {
        const conversation = db.conversations.find((item) => item.id === req.params.id);
        if (!conversation)
            throw ApiError.notFound('Konuşma bulunamadı.');
        conversation.unreadCount = 0;
        res.json(conversation);
    },
};
//# sourceMappingURL=messageController.js.map