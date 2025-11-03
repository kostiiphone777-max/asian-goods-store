'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { Loader2, CheckCircle2, XCircle, Send, Bot, Info } from 'lucide-react'

export function TelegramSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settings, setSettings] = useState({
    botToken: '',
    chatId: '',
    isEnabled: false
  })
  const [isEditingToken, setIsEditingToken] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await api.getTelegramSettings()
      // Если есть fullBotToken (boolean), значит настройки сохранены
      if (data.fullBotToken) {
        setSettings({
          botToken: data.botToken || '', // Замаскированный токен
          chatId: data.chatId || '',
          isEnabled: data.isEnabled || false
        })
        setIsEditingToken(false) // Токен сохранён, не редактируем
      } else {
        setSettings({
          botToken: '',
          chatId: '',
          isEnabled: false
        })
        setIsEditingToken(true) // Новые настройки, разрешаем редактирование
      }
    } catch (error: any) {
      console.error('Ошибка загрузки настроек:', error)
      setMessage({ type: 'error', text: error.message || 'Ошибка загрузки настроек' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      // Проверяем, что токен и chatId заполнены, если включено
      if (settings.isEnabled && (!settings.botToken || !settings.chatId)) {
        setMessage({ type: 'error', text: 'Для включения уведомлений необходимо указать токен бота и ID чата/канала' })
        return
      }

      const tokenIsMasked = settings.botToken.includes('...')
      
      if (tokenIsMasked) {
        // Токен замаскирован, значит он уже сохранен, обновляем только enabled/chatId
        await api.updateTelegramSettings({
          chatId: settings.chatId,
          isEnabled: settings.isEnabled
        })
      } else {
        // Новый или полный токен, сохраняем/обновляем полностью
        const existingSettings = await api.getTelegramSettings()
        if (existingSettings && existingSettings.fullBotToken) {
          // Настройки существуют, обновляем (включая токен если он новый)
          await api.updateTelegramSettings({
            botToken: settings.botToken,
            chatId: settings.chatId,
            isEnabled: settings.isEnabled
          })
        } else {
          // Новые настройки
          await api.saveTelegramSettings({
            botToken: settings.botToken,
            chatId: settings.chatId,
            isEnabled: settings.isEnabled
          })
        }
      }

      setMessage({ type: 'success', text: 'Настройки успешно сохранены!' })
      await loadSettings() // Перезагружаем для получения замаскированного токена
    } catch (error: any) {
      console.error('Ошибка сохранения настроек:', error)
      setMessage({ type: 'error', text: error.message || 'Ошибка сохранения настроек' })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    try {
      setTesting(true)
      setMessage(null)

      if (!settings.botToken) {
        setMessage({ type: 'error', text: 'Введите токен бота' })
        return
      }

      if (settings.botToken.includes('...')) {
        setMessage({ type: 'error', text: 'Для теста необходимо ввести полный токен. Нажмите "Изменить токен" чтобы ввести новый.' })
        return
      }

      if (!settings.chatId) {
        setMessage({ type: 'error', text: 'Укажите ID чата/канала для теста' })
        return
      }

      const result = await api.testTelegramConnection(settings.botToken, settings.chatId)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Тест успешен! Сообщение отправлено в Telegram.' })
      } else {
        setMessage({ type: 'error', text: result.message || 'Ошибка подключения к Telegram' })
      }
    } catch (error: any) {
      console.error('Ошибка теста подключения:', error)
      setMessage({ type: 'error', text: error.message || 'Ошибка теста подключения' })
    } finally {
      setTesting(false)
    }
  }

  const handleChangeToken = () => {
    setSettings({ ...settings, botToken: '' })
    setIsEditingToken(true)
    setMessage(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Настройки Telegram бота</CardTitle>
          <CardDescription>Настройка уведомлений о новых заказах</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <CardTitle>Настройки Telegram бота</CardTitle>
        </div>
        <CardDescription>
          Настройка уведомлений о новых заказах в Telegram канал или чат
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Инструкция:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Создайте бота через <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary underline">@BotFather</a> в Telegram</li>
              <li>Получите токен бота от BotFather</li>
              <li>Узнайте ID вашего чата или канала (можно использовать бота <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-primary underline">@userinfobot</a> для личного чата)</li>
              <li>Для канала: создайте канал, добавьте бота как администратора, затем используйте формат <code className="bg-muted px-1 rounded">@channelname</code> или ID канала</li>
              <li>Нажмите "Тест подключения" для проверки</li>
              <li>Сохраните настройки и включите уведомления</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="botToken">Токен бота Telegram</Label>
              {settings.botToken.includes('...') && !isEditingToken && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleChangeToken}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Изменить токен
                </Button>
              )}
            </div>
            <Input
              id="botToken"
              type="text"
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              value={settings.botToken}
              onChange={(e) => setSettings({ ...settings, botToken: e.target.value })}
              disabled={saving || (settings.botToken.includes('...') && !isEditingToken)}
            />
            <p className="text-xs text-muted-foreground">
              {settings.botToken.includes('...') && !isEditingToken
                ? 'Токен сохранён и замаскирован. Нажмите "Изменить токен" чтобы ввести новый.'
                : 'Токен бота от BotFather (формат: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatId">ID чата/канала</Label>
            <Input
              id="chatId"
              type="text"
              placeholder="@yourchannel или -1001234567890"
              value={settings.chatId}
              onChange={(e) => setSettings({ ...settings, chatId: e.target.value })}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              ID чата, канала или имя канала (например: @my_channel или -1001234567890)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isEnabled">Включить уведомления</Label>
              <p className="text-xs text-muted-foreground">
                Включить отправку уведомлений о новых заказах в Telegram
              </p>
            </div>
            <Switch
              id="isEnabled"
              checked={settings.isEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, isEnabled: checked })}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleTest}
            variant="outline"
            disabled={
              saving || 
              testing || 
              !settings.botToken || 
              !settings.chatId || 
              settings.botToken.includes('...')
            }
            className="flex items-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Тестирование...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Тест подключения
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || testing}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Сохранить настройки
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

