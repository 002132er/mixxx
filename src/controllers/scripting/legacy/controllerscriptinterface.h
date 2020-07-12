#pragma once

#include <QJSValue>
#include <QObject>

#include "controllers/softtakeover.h"
#include "util/alphabetafilter.h"

class ControllerScriptEngineLegacy;
class ControlObjectScript;
class ScriptConnection;
class ConfigKey;

/// ControllerScriptInterface is the legacy API for controller scripts to interact
/// with Mixxx. It is inserted into the JS environment as the "engine" object.
class ControllerScriptInterface : public QObject {
    Q_OBJECT
  public:
    ControllerScriptInterface(ControllerScriptEngineLegacy* m_pEngine);

    virtual ~ControllerScriptInterface();

    Q_INVOKABLE double getValue(QString group, QString name);
    Q_INVOKABLE void setValue(QString group, QString name, double newValue);
    Q_INVOKABLE double getParameter(QString group, QString name);
    Q_INVOKABLE void setParameter(QString group, QString name, double newValue);
    Q_INVOKABLE double getParameterForValue(QString group, QString name, double value);
    Q_INVOKABLE void reset(QString group, QString name);
    Q_INVOKABLE double getDefaultValue(QString group, QString name);
    Q_INVOKABLE double getDefaultParameter(QString group, QString name);
    Q_INVOKABLE QJSValue makeConnection(QString group, QString name, const QJSValue callback);
    // DEPRECATED: Use makeConnection instead.
    Q_INVOKABLE QJSValue connectControl(QString group, QString name, const QJSValue passedCallback, bool disconnect = false);
    // Called indirectly by the objects returned by connectControl
    Q_INVOKABLE void trigger(QString group, QString name);
    Q_INVOKABLE void log(QString message);
    Q_INVOKABLE int beginTimer(int interval, QJSValue scriptCode, bool oneShot = false);
    Q_INVOKABLE void stopTimer(int timerId);
    Q_INVOKABLE void scratchEnable(int deck, int intervalsPerRev, double rpm, double alpha, double beta, bool ramp = true);
    Q_INVOKABLE void scratchTick(int deck, int interval);
    Q_INVOKABLE void scratchDisable(int deck, bool ramp = true);
    Q_INVOKABLE bool isScratching(int deck);
    Q_INVOKABLE void softTakeover(QString group, QString name, bool set);
    Q_INVOKABLE void softTakeoverIgnoreNextValue(QString group, QString name);
    Q_INVOKABLE void brake(int deck, bool activate, double factor = 1.0, double rate = 1.0);
    Q_INVOKABLE void spinback(int deck, bool activate, double factor = 1.8, double rate = -10.0);
    Q_INVOKABLE void softStart(int deck, bool activate, double factor = 1.0);

    bool removeScriptConnection(const ScriptConnection conn);
    /// Execute a ScriptConnection's JS callback
    void triggerScriptConnection(const ScriptConnection conn);

    /// Handler for timers that scripts set.
    virtual void timerEvent(QTimerEvent* event);

  private:
    QHash<ConfigKey, ControlObjectScript*> m_controlCache;
    ControlObjectScript* getControlObjectScript(const QString& group, const QString& name);

    SoftTakeoverCtrl m_st;

    struct TimerInfo {
        QJSValue callback;
        bool oneShot;
    };
    QHash<int, TimerInfo> m_timers;

    QVarLengthArray<int> m_intervalAccumulator;
    QVarLengthArray<mixxx::Duration> m_lastMovement;
    QVarLengthArray<double> m_dx, m_rampTo, m_rampFactor;
    QVarLengthArray<bool> m_ramp, m_brakeActive, m_softStartActive;
    QVarLengthArray<AlphaBetaFilter*> m_scratchFilters;
    QHash<int, int> m_scratchTimers;
    /// Applies the accumulated movement to the track speed
    void scratchProcess(int timerId);
    bool isDeckPlaying(const QString& group);
    double getDeckRate(const QString& group);

    ControllerScriptEngineLegacy* m_pScriptEngineLegacy;
};
