// dispute.controller.js
export const getdisputes = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'dispute controller ready' });
    } catch (error) {
        next(error);
    }
};
