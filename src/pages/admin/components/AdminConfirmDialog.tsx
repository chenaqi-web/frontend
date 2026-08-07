interface Props {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}

export default function AdminConfirmDialog({ title, message, onCancel, onConfirm }: Props) {
  const confirm = async () => {
    await onConfirm()
  }

  return (
    <div className="category-modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div className="category-modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="category-modal-header">
          <div>
            <span className="category-modal-eyebrow">请确认操作</span>
            <h3 id="confirm-modal-title">{title}</h3>
          </div>
          <button type="button" className="category-modal-close" aria-label="关闭弹窗" onClick={onCancel}>×</button>
        </div>
        <p className="confirm-modal-message">{message}</p>
        <div className="category-modal-actions">
          <button type="button" className="category-modal-cancel" onClick={onCancel}>取消</button>
          <button type="button" className="confirm-modal-submit" onClick={() => void confirm()}>确认删除</button>
        </div>
      </div>
    </div>
  )
}
