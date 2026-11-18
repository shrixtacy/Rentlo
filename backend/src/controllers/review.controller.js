// review.controller.js
export const getreviews = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'review controller ready' });
    } catch (error) {
        next(error);
    }
};
