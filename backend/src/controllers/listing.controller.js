// listing.controller.js
export const getlistings = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'listing controller ready' });
    } catch (error) {
        next(error);
    }
};
