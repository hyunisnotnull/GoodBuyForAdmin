const fs = require('fs');
const eventModel = require('../model/eventModel');

const eventService = {
    list: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }
    
        eventModel.getEvents((error, events) => {
            if (error) {
                console.error(error);
                res.render('event/list', { loginedAdmin: req.user, events: [] });
            } else {
                res.render('event/list', { loginedAdmin: req.user, events });
            }
        });
    },

    registerEventForm: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }
        res.render('event/register_event_form', { loginedAdmin: req.user, eventId: null });
    },

    registerEventConfirm: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        const post = req.body;
        const imageFilenames = req.files.map(file => file.filename).join(', ');

        eventModel.createEvent(post, imageFilenames, (error, result) => {
            if (error) {
                console.error(error);
                return res.render('event/register_event_ng');
            }

            const newEventId = result.insertId;
            const eventDir = `c:\\goodbuyforadmin\\upload\\event_images\\${newEventId}\\`;
            if (!fs.existsSync(eventDir)) {
                fs.mkdirSync(eventDir, { recursive: true });
            }

            req.files.forEach(file => {
                const tempPath = `c:\\goodbuyforadmin\\upload\\event_images\\temp\\${file.filename}`;
                const newPath = `${eventDir}${file.filename}`;
                fs.renameSync(tempPath, newPath);
            });

            res.redirect('/event/list');
        });
    },

    modifyEventForm: (req, res) => {
        const eventId = req.params.id;

        eventModel.getEventById(eventId, (error, event) => {
            if (error || event.length === 0) {
                console.error(error);
                res.render('event/modify_event_ng');
            } else {
                res.render('event/modify_event_form', { loginedAdmin: req.user, event: event[0] });
            }
        });
    },

    modifyEventConfirm: (req, res) => {
        const eventId = req.params.id;
        const post = req.body;

        eventModel.getEventById(eventId, (error, result) => {
            if (error || result.length === 0) {
                console.error(error);
                return res.render('event/modify_event_ng');
            }

            const existingImageFilenames = result[0].E_IMAGE;
            const newImageFilenames = req.files.length > 0 
                ? req.files.map(file => file.filename).join(', ') 
                : existingImageFilenames; 

            eventModel.updateEvent(post, newImageFilenames, eventId, (error) => {
                if (error) {
                    console.error(error);
                    res.render('event/modify_event_ng');
                } else {
                    const eventDir = `c:\\goodbuyforadmin\\upload\\event_images\\${eventId}\\`;
                    if (!fs.existsSync(eventDir)) {
                        fs.mkdirSync(eventDir, { recursive: true });
                    }

                    req.files.forEach(file => {
                        const tempPath = `c:\\goodbuyforadmin\\upload\\event_images\\temp\\${file.filename}`;
                        const newPath = `${eventDir}${file.filename}`;
                        fs.renameSync(tempPath, newPath);
                    });

                    res.redirect('/event/list');
                }
            });
        });
    },

    eventStatus: (req, res) => {
        const eventId = req.params.id;

        eventModel.getEventById(eventId, (error, result) => {
            if (error || result.length === 0) {
                console.error(error);
                return res.render('event/update_status_ng');
            }

            const currentStatus = result[0].E_ACTIVE;
            const newStatus = currentStatus === 2 ? 3 : 2; // 2는 활성화, 3은 비활성화

            eventModel.updateEventStatus(eventId, newStatus, (error) => {
                if (error) {
                    console.error(error);
                    return res.render('event/update_status_ng');
                }
                res.redirect('/event/list');
            });
        });
    },

    deleteEventConfirm: (req, res) => {
        const eventId = req.body.eventId;

        eventModel.deleteEvent(eventId, (error) => {
            if (error) {
                console.error(error);
                res.render('event/delete_event_ng');
            } else {
                res.redirect('/event/list');
            }
        });
    },
};

module.exports = eventService;
