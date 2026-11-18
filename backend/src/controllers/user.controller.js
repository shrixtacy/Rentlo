// user.controller.js
export const getusers = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, message: 'user controller ready' });
    } catch (error) {
        next(error);
    }
};
