'use client';

/**
 * JournalFormModal
 *
 * A slide-up sheet for creating or editing a journal entry.
 * Uses react-hook-form + zod for validation.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import type { Journal, CreateJournalInput, UpdateJournalInput, Emotion } from '@/types/journal';
import { EMOTION_LIST } from '@/constants/emotions';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title is too long'),
  content: z.string().max(5000, 'Content is too long'),
  initialCheckIn: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface JournalFormModalProps {
  isOpen: boolean;
  isBusy: boolean;
  editingJournal: Journal | null;
  onClose: () => void;
  onSubmit: (values: CreateJournalInput | UpdateJournalInput) => void;
}

export function JournalFormModal({
  isOpen,
  isBusy,
  editingJournal,
  onClose,
  onSubmit,
}: JournalFormModalProps) {
  const isEditing = editingJournal !== null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', content: '', initialCheckIn: null },
  });

  const selectedEmotion = useWatch({ control, name: 'initialCheckIn' });

  // Reset the form every time the modal opens.
  // - Create mode (editingJournal is null): always start with empty defaults.
  // - Edit mode: populate with the journal being edited.
  // isOpen is in the dependency array so the effect fires on each open,
  // not only when editingJournal reference changes.
  useEffect(() => {
    if (!isOpen) return;
    if (editingJournal) {
      reset({
        title: editingJournal.title,
        content: editingJournal.content,
        initialCheckIn: editingJournal.initialCheckIn,
      });
    } else {
      reset({ title: '', content: '', initialCheckIn: null });
    }
  }, [isOpen, editingJournal, reset]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Watch fields to detect changes dynamically
  const watchedTitle = useWatch({ control, name: 'title' }) || '';
  const watchedContent = useWatch({ control, name: 'content' }) || '';

  const hasMeaningfulChanges = React.useMemo(() => {
    if (!editingJournal) return true; // Always allow save in create mode
    const originalTitle = (editingJournal.title || '').trim();
    const originalContent = (editingJournal.content || '').trim();
    const originalEmotion = editingJournal.initialCheckIn || null;

    const currentTitle = (watchedTitle || '').trim();
    const currentContent = (watchedContent || '').trim();
    const currentEmotion = selectedEmotion || null;

    return (
      originalTitle !== currentTitle ||
      originalContent !== currentContent ||
      originalEmotion !== currentEmotion
    );
  }, [editingJournal, watchedTitle, watchedContent, selectedEmotion]);

  const handleFormSubmit = (values: FormValues) => {
    if (isEditing && !hasMeaningfulChanges) {
      // Exit edit mode immediately as though it completed successfully
      onClose();
      return;
    }
    onSubmit({
      title: values.title,
      content: values.content,
      initialCheckIn: (values.initialCheckIn || null) as Emotion | null,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="journal-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-xl rounded-t-3xl bg-white px-6 pt-6 pb-8 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:px-8"
          >
            {/* Handle bar (mobile) */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-stone-200 sm:hidden" aria-hidden="true" />

            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <h2 id="journal-modal-title" className="text-lg font-semibold text-stone-900">
                {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h2>
              <button
                id="close-journal-modal-btn"
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="journal-title" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Title
                </label>
                <input
                  id="journal-title"
                  type="text"
                  placeholder="What's on your mind?"
                  autoComplete="off"
                  {...register('title')}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 aria-invalid:border-red-400"
                  aria-invalid={errors.title ? 'true' : 'false'}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="mt-1.5 text-xs text-red-500" role="alert">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Initial Check-In selector */}
              <div>
                <p id="check-in-label" className="text-sm font-semibold text-stone-900">How are you arriving today?</p>
                <p id="check-in-description" className="mb-3 text-xs text-stone-500">
                  Choose the feeling that feels closest to how you&apos;re arriving today. Selecting an emotion is optional.
                </p>
                <div
                  role="group"
                  aria-labelledby="check-in-label"
                  aria-describedby="check-in-description"
                  className="flex flex-wrap gap-2"
                >
                  {EMOTION_LIST.map((emotion) => (
                    <button
                      key={emotion.id}
                      type="button"
                      onClick={() => {
                        const newValue = selectedEmotion === emotion.id ? null : emotion.id;
                        setValue('initialCheckIn', newValue, { shouldValidate: true });
                      }}
                      className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                        selectedEmotion === emotion.id
                          ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                          : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                      aria-pressed={selectedEmotion === emotion.id}
                      aria-label={`${emotion.emoji} ${emotion.label}`}
                    >
                      <span className="text-sm" aria-hidden="true">{emotion.emoji}</span>
                      <span>{emotion.label}</span>
                    </button>
                  ))}
                </div>
                {/* hidden input so RHF can track initialCheckIn value */}
                <input type="hidden" {...register('initialCheckIn')} />
                {errors.initialCheckIn && (
                  <p className="mt-1.5 text-xs text-red-500" role="alert">
                    {errors.initialCheckIn.message}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="journal-content" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Content <span className="text-stone-400">(optional)</span>
                </label>
                <textarea
                  id="journal-content"
                  rows={5}
                  placeholder="Write freely…"
                  {...register('content')}
                  className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-900 placeholder:text-stone-400 transition-colors focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 aria-invalid:border-red-400"
                  aria-invalid={errors.content ? 'true' : 'false'}
                  aria-describedby={errors.content ? 'content-error' : undefined}
                />
                {errors.content && (
                  <p id="content-error" className="mt-1.5 text-xs text-red-500" role="alert">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="cursor-pointer rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition-all hover:bg-stone-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                  Cancel
                </button>
                <button
                  id="submit-journal-btn"
                  type="submit"
                  disabled={isBusy || (isEditing && !hasMeaningfulChanges)}
                  className="inline-flex enabled:cursor-pointer items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-all enabled:hover:bg-stone-700 enabled:active:scale-[0.98] disabled:cursor-default disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                >
                  {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                  {isEditing ? 'Save changes' : 'Save entry'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
