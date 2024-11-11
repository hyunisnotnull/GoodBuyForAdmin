const cron = require('node-cron');
const eventModel = require('../model/eventModel');
const adminModel = require('../model/adminModel');

const scheduleEventDeactivation = () => {
    cron.schedule('0 0 * * *', () => { // 00시 업데이트 // 테스트시 '* * * * * *' 사용
        console.log('만료된 이벤트 찾는중');
        const now = new Date();

        eventModel.getAllActiveEvents((error, events) => {
            if (error) {
                console.error('Fetching Error :', error);
                return;
            }

            events.forEach(event => {
                const endDate = new Date(event.E_END_DATE);
                if (endDate < now) {
                    let newStatus;

                    // 홈광고 (E_ACTIVE === 1)
                    if (event.E_ACTIVE === 1) {
                        newStatus = 2; // 홈광고는 2 (비활성화)
                    }
                    // 자체광고 (E_ACTIVE === 3)
                    else if (event.E_ACTIVE === 3) {
                        newStatus = 4; // 자체광고는 4 (비활성화)
                    }

                    if (newStatus) {
                        eventModel.updateEventStatus(event.E_NO, newStatus, (error) => {
                            if (error) {
                                console.error(`비활성화 실패 : ${event.E_NO}:`, error);
                            } else {
                                console.log(`Event ${event.E_NO} 비활성화 성공`);
                            }
                        });
                    }
                }
            });
        });
    });
};

const scheduleBanDeactivation = () => {
    cron.schedule('0 0 * * *', () => { // 00시 업데이트 // 테스트시 '* * * * * *' 사용
        console.log('정지 해제 유저 찾는중');
        const now = new Date();

        adminModel.getAllActiveUser((error, users) => {
            if (error) {
                console.error('Fetching Error :', error);
                return;
            }

            users.forEach(user => {
                const endDate = new Date(user.U_BAN_END_DATE);
                if (endDate < now) {
                    adminModel.reactivateUser(user.U_ID, (error) => {
                        if (error) {
                            console.error(`정지 해제 실패 : ${user.U_ID}:`, error);
                        } else {
                            console.log(`Event ${user.U_ID} 정지 해제 성공`);
                        }
                    });
                }
            });
        });
    });
};

module.exports = { scheduleEventDeactivation, scheduleBanDeactivation };
