#pragma once

#include <QOpenGLWindow>

class WGLWidget;

/// Helper class used by wglwidgetqopengl

class OpenGLWindow : public QOpenGLWindow {
    Q_OBJECT

    WGLWidget* m_pWidget;
    bool m_dirty{};

  public:
    OpenGLWindow(WGLWidget* widget);
    ~OpenGLWindow();

    void widgetDestroyed();

  private:
    void initializeGL() override;
    void paintGL() override;
    void resizeGL(int w, int h) override;
    bool event(QEvent* ev) override;
};
