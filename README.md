# Сервис для аутентификации по сертификату Крипто ПРО

Содержимое репозитория:
- pack - ДЛЯ ПРИЛОЖЕНИЯ. Файлы для работоспособности сервиса
- service - САМ СЕРВИС.

## Требования для работы:
- Запустить API приложения (репозиторий CertificateAuthentification_API).
- Установить "Крипто ПРО" на компьютер, иначе программа будет выдавать ошибку.
- Установить расширение в браузере CADES browser plugin, иначе программа будет выдавать ошибку и требовать установить расширение.
- Иметь минимум один сертификат Крипто ПРО.

## Как подключить приложение к сервису
- залить папки из pack в приложение (папка auth и и shared)
- внедрить функцию consumeTokenFromUrl() (обычно пишут в главный файл App.tsx). Он нужен для переадресации после проверки токена
```javascript
import { useEffect } from 'react';
import { consumeTokenFromUrl } from './auth/auth';

useEffect(() => {
    consumeTokenFromUrl();
  }, []);

```
- внедрить код получения токена
В моем случае он написан при клике на кнопку и при наличии токена направляет на страницу ChooseApp
```javascript
import { useNavigate } from 'react-router-dom';
import { redirectToCertService } from '../../auth/auth';

const navigate = useNavigate();

// функция проверки токена
const onEnter = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        redirectToCertService();
        return;
    }

    navigate("ChooseApp/");
};
```

## Получение информации о сертификате (имя, срок действия и т.д)
- Импортируем AuthProvider и вставляем в main.tsx приложения
```javascript
// пример
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
)

```

- Получаем данные с помощью хука useAuth
```javascript
const { user } = useAuth();
```