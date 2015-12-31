#include "util/battery/battery.h"

#ifdef Q_OS_LINUX
#include "util/battery/batterylinux.h"
#elif defined(Q_OS_WIN)
#include "util/battery/batterywindows.h"
#elif defined(Q_OS_MAC)
#include "util/battery/batterymac.h"
#endif

// interval (in ms) of the timer which calls update()
const int kiUpdateInterval = 5000;

Battery::Battery(QObject *parent)
        : QObject(parent),
          m_chargingState(UNKNOWN),
          m_dPercentage(0.0),
          m_iMinutesLeft(0),
          timer(this) {
    connect(&timer, SIGNAL(timeout()), this, SLOT(update()));
    timer.start(kiUpdateInterval);
}

Battery::~Battery() {
}

Battery* Battery::getBattery(QObject *parent) {
#ifdef Q_OS_LINUX
    return new BatteryLinux(parent);
#elif defined(Q_OS_WIN)
    return new BatteryWindows(parent);
#elif defined(Q_OS_MAC)
    return new BatteryMac(parent);
#else
    return nullptr;
#endif
}

void Battery::update() {
    double lastPercentage = m_dPercentage;
    int lastMinutesLeft = m_iMinutesLeft;
    ChargingState lastChargingState = m_chargingState;
    read();
    if (lastPercentage != m_dPercentage ||
        lastChargingState != m_chargingState ||
        lastMinutesLeft != m_iMinutesLeft) {
        emit(stateChanged());
    }
}
