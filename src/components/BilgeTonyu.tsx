'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Film, Search, Plus, Trash2, Star, 
  ExternalLink, Tag, Calendar, CheckCircle2, Bookmark, BarChart2, Edit3, Check
} from 'lucide-react';
import { BookItem, MovieItem, ResearchItem } from '@/types';
import { soundAlert } from '@/utils/sound';

interface BilgeTonyuProps {
  books: BookItem[];
  movies: MovieItem[];
  research: ResearchItem[];
  onAddBook: (book: Omit<BookItem, 'id'>) => void;
  onUpdateBook: (id: string, updates: Partial<BookItem>) => void;
  onDeleteBook: (id: string) => void;
  onAddMovie: (movie: Omit<MovieItem, 'id'>) => void;
  onDeleteMovie: (id: string) => void;
  onAddResearch: (item: Omit<ResearchItem, 'id' | 'updatedAt'>) => void;
  onUpdateResearch: (id: string, updates: Partial<ResearchItem>) => void;
  onDeleteResearch: (id: string) => void;
}

export const BilgeTonyu: React.FC<BilgeTonyuProps> = ({
  books,
  movies,
  research,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onAddMovie,
  onDeleteMovie,
  onAddResearch,
  onUpdateResearch,
  onDeleteResearch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'books' | 'movies' | 'research'>('books');

  // Kitap Ekleme
  const [showBookForm, setShowBookForm] = useState<boolean>(false);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [bookAuthor, setBookAuthor] = useState<string>('');
  const [bookMainCat, setBookMainCat] = useState<BookItem['mainCategory']>('Bilim');
  const [bookSubCat, setBookSubCat] = useState<string>('');
  const [bookSummary, setBookSummary] = useState<string>('');
  const [bookRating, setBookRating] = useState<number>(5);
  const [bookStatus, setBookStatus] = useState<BookItem['status']>('okunuyor');

  // Film Ekleme
  const [showMovieForm, setShowMovieForm] = useState<boolean>(false);
  const [movieTitle, setMovieTitle] = useState<string>('');
  const [movieDirector, setMovieDirector] = useState<string>('');
  const [movieGenre, setMovieGenre] = useState<string>('Bilim Kurgu');
  const [movieYear, setMovieYear] = useState<number>(2024);
  const [movieReview, setMovieReview] = useState<string>('');
  const [movieRating, setMovieRating] = useState<number>(5);

  // Araştırma Ekleme
  const [showResearchForm, setShowResearchForm] = useState<boolean>(false);
  const [researchTitle, setResearchTitle] = useState<string>('');
  const [researchDomains, setResearchDomains] = useState<string>('Yapay Zeka, Fizik');
  const [researchNotes, setResearchNotes] = useState<string>('');
  const [researchSources, setResearchSources] = useState<string>('');
  const [researchStatus, setResearchStatus] = useState<ResearchItem['status']>('devam_ediyor');

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    onAddBook({
      title: bookTitle.trim(),
      author: bookAuthor.trim() || 'Bilinmiyor',
      mainCategory: bookMainCat,
      subCategory: bookSubCat.trim() || undefined,
      summary: bookSummary.trim(),
      rating: bookRating,
      status: bookStatus,
      readDate: new Date().toISOString().split('T')[0],
    });

    setBookTitle('');
    setBookAuthor('');
    setBookSubCat('');
    setBookSummary('');
    setShowBookForm(false);
    soundAlert('beep');
  };

  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle.trim()) return;

    onAddMovie({
      title: movieTitle.trim(),
      director: movieDirector.trim() || undefined,
      genre: movieGenre.trim() || 'Genel',
      year: movieYear || undefined,
      review: movieReview.trim() || undefined,
      rating: movieRating,
      watchedDate: new Date().toISOString().split('T')[0],
    });

    setMovieTitle('');
    setMovieDirector('');
    setMovieReview('');
    setShowMovieForm(false);
    soundAlert('beep');
  };

  const handleCreateResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchTitle.trim()) return;

    const domainList = researchDomains.split(',').map(d => d.trim()).filter(Boolean);

    onAddResearch({
      title: researchTitle.trim(),
      domains: domainList.length > 0 ? domainList : ['Genel'],
      notes: researchNotes.trim(),
      sources: researchSources.trim() || undefined,
      status: researchStatus,
    });

    setResearchTitle('');
    setResearchNotes('');
    setResearchSources('');
    setShowResearchForm(false);
    soundAlert('beep');
  };

  return (
    <div className="space-y-6">
      {/* Üst Bilgilendirme Banner */}
      <div className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-5 light:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Kişisel Entelektüel Bellek
            </span>
            <h2 className="text-xl font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-0.5">BilgeTonyu Arşivi</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-1">
              Kitaplar, filmler ve derinlemesine araştırmalar. Durumları (okunuyor, okundu, devam ediyor, tamamlandı) tek dokunuşla güncelleyebilirsiniz.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-800 light:border-zinc-300">
              📚 {books.length} Kitap • 🎬 {movies.length} Film • 🔬 {research.length} Araştırma
            </span>
          </div>
        </div>
      </div>

      {/* 3'lü Alt Sekme Seçici */}
      <div className="flex bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-200/60 p-1 rounded-xl border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-300 w-full max-w-sm">
        <button
          onClick={() => setActiveSubTab('books')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'books'
              ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-white text-zinc-100 dark:text-zinc-100 light:text-zinc-900 border border-zinc-700/60 light:border-zinc-300 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Kitaplar ({books.length})
        </button>
        <button
          onClick={() => setActiveSubTab('movies')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'movies'
              ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-white text-zinc-100 dark:text-zinc-100 light:text-zinc-900 border border-zinc-700/60 light:border-zinc-300 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <Film className="w-3.5 h-3.5" /> Filmler ({movies.length})
        </button>
        <button
          onClick={() => setActiveSubTab('research')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'research'
              ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-white text-zinc-100 dark:text-zinc-100 light:text-zinc-900 border border-zinc-700/60 light:border-zinc-300 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <Search className="w-3.5 h-3.5" /> Araştırma ({research.length})
        </button>
      </div>

      {/* KİTAPLAR SEKME İÇERİĞİ */}
      {activeSubTab === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800">Okuma Kayıtları & Kitap Özetleri</h3>
            <button
              onClick={() => setShowBookForm(!showBookForm)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 light:text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Kitap Ekle
            </button>
          </div>

          {showBookForm && (
            <form onSubmit={handleCreateBook} className="bg-zinc-900/70 dark:bg-zinc-900/70 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 p-4 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Kitap Adı..."
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Yazar..."
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Ana Kategori:</label>
                  <select
                    value={bookMainCat}
                    onChange={(e) => setBookMainCat(e.target.value as BookItem['mainCategory'])}
                    className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
                  >
                    <option value="Bilim">Bilim</option>
                    <option value="Roman">Roman</option>
                    <option value="Felsefe">Felsefe</option>
                    <option value="Tarih">Tarih</option>
                    <option value="Kişisel Gelişim">Kişisel Gelişim</option>
                    <option value="Teknoloji">Teknoloji</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Alt Alan / Tür Detayı:</label>
                  <input
                    type="text"
                    placeholder="Örn: Biyoloji, Bilim Kurgu..."
                    value={bookSubCat}
                    onChange={(e) => setBookSubCat(e.target.value)}
                    className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Okuma Durumu:</label>
                  <select
                    value={bookStatus}
                    onChange={(e) => setBookStatus(e.target.value as BookItem['status'])}
                    className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-semibold"
                  >
                    <option value="okunuyor">📖 Okunuyor</option>
                    <option value="tamamlandi">✅ Okundu</option>
                    <option value="okunacak">⏳ Okunacak</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Değerlendirme (1-5):</label>
                  <select
                    value={bookRating}
                    onChange={(e) => setBookRating(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-mono"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>⭐ {r} Yıldız</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Kitap Özeti & Önemli Çıkarımlar:</label>
                <textarea
                  rows={3}
                  placeholder="Kitabın ana tezi ve özet notlar..."
                  value={bookSummary}
                  onChange={(e) => setBookSummary(e.target.value)}
                  className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl p-2.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBookForm(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs rounded-xl"
                >
                  Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Kitap Listesi (Okunuyor / Okundu Durum Değiştirme Butonlu) */}
          <div className="space-y-3">
            {books.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Henüz kayıtlı kitap bulunmuyor.</p>
            ) : (
              books.map((b) => (
                <div key={b.id} className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 light:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Durum Değiştirme Rozeti */}
                        <button
                          onClick={() => {
                            const nextStatus = b.status === 'okunuyor' ? 'tamamlandi' : b.status === 'tamamlandi' ? 'okunacak' : 'okunuyor';
                            onUpdateBook(b.id, { status: nextStatus });
                            soundAlert('beep');
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold transition-all ${
                            b.status === 'tamamlandi'
                              ? 'bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100'
                              : b.status === 'okunuyor'
                              ? 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-zinc-700'
                              : 'bg-zinc-900 text-zinc-500'
                          }`}
                          title="Durumu değiştirmek için tıkla"
                        >
                          {b.status === 'tamamlandi' ? '✅ Okundu' : b.status === 'okunuyor' ? '📖 Okunuyor' : '⏳ Okunacak'}
                        </button>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 font-mono text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                          {b.mainCategory}
                        </span>

                        {b.subCategory && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-200 font-mono text-zinc-400">
                            {b.subCategory}
                          </span>
                        )}

                        <span className="text-xs text-zinc-500 font-mono ml-auto">
                          {'★'.repeat(b.rating || 5)}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-2">{b.title}</h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600">{b.author}</p>

                      {b.summary && (
                        <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mt-2 bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-50 p-2.5 rounded-xl border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 leading-relaxed">
                          {b.summary}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`"${b.title}" kitabını silmek istiyor musunuz?`)) {
                          onDeleteBook(b.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                      title="Kitabı Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FİLMLER SEKME İÇERİĞİ */}
      {activeSubTab === 'movies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800">İzlenen Filmler</h3>
            <button
              onClick={() => setShowMovieForm(!showMovieForm)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 light:text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Film Ekle
            </button>
          </div>

          {showMovieForm && (
            <form onSubmit={handleCreateMovie} className="bg-zinc-900/70 dark:bg-zinc-900/70 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 p-4 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Film Adı..."
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Yönetmen..."
                  value={movieDirector}
                  onChange={(e) => setMovieDirector(e.target.value)}
                  className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Tür..."
                  value={movieGenre}
                  onChange={(e) => setMovieGenre(e.target.value)}
                  className="bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
                />
                <input
                  type="number"
                  placeholder="Yıl..."
                  value={movieYear}
                  onChange={(e) => setMovieYear(parseInt(e.target.value) || 2024)}
                  className="bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-mono"
                />
                <select
                  value={movieRating}
                  onChange={(e) => setMovieRating(parseInt(e.target.value))}
                  className="bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 font-mono"
                >
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>⭐ {r} Puan</option>
                  ))}
                </select>
              </div>

              <textarea
                rows={2}
                placeholder="Film hakkında kısa düşünce..."
                value={movieReview}
                onChange={(e) => setMovieReview(e.target.value)}
                className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl p-2.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMovieForm(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs rounded-xl"
                >
                  Kaydet
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {movies.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center col-span-2">Henüz kayıtlı film bulunmuyor.</p>
            ) : (
              movies.map((m) => (
                <div key={m.id} className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 flex flex-col justify-between light:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-mono">{m.year ? m.year : ''} • {m.genre}</span>
                      <span className="text-zinc-400 font-mono">{'★'.repeat(m.rating || 5)}</span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">{m.title}</h4>
                    {m.director && <p className="text-xs text-zinc-400">{m.director}</p>}

                    {m.review && (
                      <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mt-2 bg-zinc-950/50 dark:bg-zinc-950/50 light:bg-zinc-50 p-2 rounded-xl border border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 leading-relaxed italic">
                        &quot;{m.review}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/60 dark:border-zinc-800/60 light:border-zinc-200 text-[11px] text-zinc-500">
                    <span className="font-mono">İzlendi: {m.watchedDate}</span>
                    <button
                      onClick={() => {
                        if (confirm(`"${m.title}" filmini silmek istiyor musunuz?`)) {
                          onDeleteMovie(m.id);
                        }
                      }}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ARAŞTIRMA SEKME İÇERİĞİ */}
      {activeSubTab === 'research' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800">Araştırma Notları & İlgili Alanlar</h3>
            <button
              onClick={() => setShowResearchForm(!showResearchForm)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-900 hover:bg-zinc-700 text-zinc-200 dark:text-zinc-200 light:text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Araştırma Konusu Ekle
            </button>
          </div>

          {showResearchForm && (
            <form onSubmit={handleCreateResearch} className="bg-zinc-900/70 dark:bg-zinc-900/70 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Araştırma Başlığı..."
                  value={researchTitle}
                  onChange={(e) => setResearchTitle(e.target.value)}
                  className="flex-1 bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
                />
                <select
                  value={researchStatus}
                  onChange={(e) => setResearchStatus(e.target.value as ResearchItem['status'])}
                  className="bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-2.5 py-2 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700"
                >
                  <option value="devam_ediyor">⚡ Devam Ediyor</option>
                  <option value="tamamlandi">✅ Tamamlandı</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="İlgili Alanlar (virgülle ayırın, örn: Yapay Zeka, Fizik, Biyomekanik)..."
                value={researchDomains}
                onChange={(e) => setResearchDomains(e.target.value)}
                className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
              />

              <textarea
                rows={3}
                placeholder="Araştırma notları, tespitler ve özet..."
                value={researchNotes}
                onChange={(e) => setResearchNotes(e.target.value)}
                className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl p-2.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800 focus:outline-none"
              />

              <input
                type="text"
                placeholder="Kaynaklar / Linkler..."
                value={researchSources}
                onChange={(e) => setResearchSources(e.target.value)}
                className="w-full bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-50 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-200 dark:text-zinc-200 light:text-zinc-800"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResearchForm(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100 font-semibold text-xs rounded-xl"
                >
                  Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Araştırma Listesi (Durum Düzenleme / Değiştirme Butonlu) */}
          <div className="space-y-3">
            {research.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Henüz araştırma kaydı bulunmuyor.</p>
            ) : (
              research.map((r) => (
                <div key={r.id} className="bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 rounded-2xl p-4 light:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {/* Durum Değiştirme */}
                        <button
                          onClick={() => {
                            const newStatus = r.status === 'devam_ediyor' ? 'tamamlandi' : 'devam_ediyor';
                            onUpdateResearch(r.id, { status: newStatus });
                            soundAlert('beep');
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold transition-all ${
                            r.status === 'tamamlandi'
                              ? 'bg-zinc-200 dark:bg-zinc-200 light:bg-zinc-900 text-zinc-900 dark:text-zinc-900 light:text-zinc-100'
                              : 'bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 border border-zinc-700'
                          }`}
                          title="Durumu değiştirmek için tıkla"
                        >
                          {r.status === 'tamamlandi' ? '✅ Tamamlandı' : '⚡ Devam Ediyor'}
                        </button>

                        {r.domains.map((dom, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 font-mono text-zinc-400">
                            {dom}
                          </span>
                        ))}
                      </div>

                      <h4 className="text-sm font-bold text-zinc-100 dark:text-zinc-100 light:text-zinc-900 mt-1">{r.title}</h4>

                      <p className="text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 mt-2 leading-relaxed bg-zinc-950/40 dark:bg-zinc-950/40 light:bg-zinc-50 p-2.5 rounded-xl border border-zinc-800/50 dark:border-zinc-800/50 light:border-zinc-200">
                        {r.notes}
                      </p>

                      {r.sources && (
                        <p className="text-[11px] text-zinc-500 mt-2 font-mono">
                          Kaynaklar: <span className="text-zinc-400">{r.sources}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`"${r.title}" konusunu silmek istiyor musunuz?`)) {
                          onDeleteResearch(r.id);
                        }
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors shrink-0"
                      title="Araştırmayı Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
