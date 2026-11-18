// booking.controller.js
export const getbookings = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'booking controller ready' });
    } catch (error) {
        next(error);
    }
};
