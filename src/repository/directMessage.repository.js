import DirectMessage from "../models/directMessage.model.js";
import ServerError from "../helpers/error.helper.js";

class DirectMessageRepository {
    async create({ sender, receiver, content, image }) {
        try {
            return await DirectMessage.create({ sender, receiver, content, image });
        } catch (error) {
            throw new ServerError("Error al guardar el mensaje directo", 500);
        }
    }

    async getChatHistory(userA, userB) {
        try {
            return await DirectMessage.find({
                $or: [
                    { sender: userA, receiver: userB },
                    { sender: userB, receiver: userA }
                ]
            })
            .sort({ created_at: 1 })
            .populate('sender', 'name username tag avatar avatar_config')
            .populate('receiver', 'name username tag avatar avatar_config');
        } catch (error) {
            throw new ServerError("Error al obtener el historial de mensajes", 500);
        }
    }

    async getMyConversations(userId) {
        try {
            // Buscamos los últimos mensajes de cada conversación
            return await DirectMessage.aggregate([
                {
                    $match: {
                        $or: [{ sender: userId }, { receiver: userId }]
                    }
                },
                {
                    $sort: { created_at: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$sender", userId] },
                                "$receiver",
                                "$sender"
                            ]
                        },
                        lastMessage: { $first: "$$ROOT" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "contactInfo"
                    }
                },
                {
                    $unwind: "$contactInfo"
                },
                {
                    $project: {
                        contact: {
                            id: "$contactInfo._id",
                            name: "$contactInfo.name",
                            username: "$contactInfo.username",
                            tag: "$contactInfo.tag",
                            avatar: "$contactInfo.avatar",
                            avatar_config: "$contactInfo.avatar_config"
                        },
                        lastMessage: {
                            content: "$lastMessage.content",
                            created_at: "$lastMessage.created_at",
                            is_read: "$lastMessage.is_read",
                            sender: "$lastMessage.sender"
                        }
                    }
                },
                {
                    $sort: { "lastMessage.created_at": -1 }
                }
            ]);
        } catch (error) {
            console.error(error);
            throw new ServerError("Error al obtener las conversaciones", 500);
        }
    }
}

export default new DirectMessageRepository();
