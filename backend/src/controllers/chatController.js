const ragService = require('../services/ragService');

/**
 * Handle student chat queries (RAG)
 */
exports.chat = async (req, res) => {
  try {
    const { message, jobId, history = [] } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ message: 'Vui lòng nhập lời nhắn' });
    }

    // Special Case: User wants to summarize or recall the conversation history
    const isHistoryRequest = 
      (message.toLowerCase().includes('tóm tắt') && (message.toLowerCase().includes('cuộc trò chuyện') || message.toLowerCase().includes('hội thoại'))) ||
      (message.toLowerCase().includes('nãy') && (message.toLowerCase().includes('hỏi') || message.toLowerCase().includes('nói'))) ||
      (message.toLowerCase().includes('chúng ta đã thảo luận gì'));

    if (isHistoryRequest) {
      if (!jobId) return res.status(400).json({ message: 'Thiếu jobId để xử lý lịch sử hội thoại' });
      
      const chatSummary = await ragService.generateChatSummary(jobId, history);
      return res.json({
        message: chatSummary || "Không thể tóm tắt cuộc hội thoại vào lúc này.",
        role: 'assistant',
        type: 'chat_summary',
        timestamp: new Date()
      });
    }

    // Normal RAG Chat
    // Note: We should pass jobId to getRelevantContext in the future for better scoping
    const response = await ragService.chatWithBrain(userId, message);

    res.json({
      message: response,
      role: 'assistant',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
