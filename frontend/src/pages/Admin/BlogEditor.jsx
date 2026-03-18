import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import Youtube from '@tiptap/extension-youtube';
import { motion } from 'framer-motion';
import API from '../../services/api';

import {
  FiBold, FiItalic, FiUnderline, FiCode, FiLink,
  FiImage, FiList, FiAlignLeft, FiAlignCenter, 
  FiAlignRight, FiMaximize2, FiSave, 
  FiEye, FiUpload, FiX, FiYoutube, FiTable, 
  FiCornerUpLeft, FiCornerUpRight, FiDelete
} from 'react-icons/fi';
import { 
  FaQuoteRight, FaHighlighter,
  FaStrikethrough, FaListOl
} from 'react-icons/fa';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const ToolbarButton = ({ onClick, isActive, icon: Icon, title, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all flex items-center justify-center ${
        isActive 
          ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
          : 'text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent'
      }`}
    >
      <Icon size={16} />
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-white/10 mx-1" />;

  return (
    <div className="sticky top-0 z-10 bg-[#0f1115]/90 backdrop-blur-md border-b border-white/10 p-2 flex flex-wrap items-center gap-1 shadow-sm">
      
      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={FiCornerUpLeft} title="Undo" />
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={FiCornerUpRight} title="Redo" />
      
      <Divider />

      {/* Headings */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
        }}
        className="bg-[#1a1d24] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 hover:border-white/20 transition-colors appearance-none cursor-pointer"
        value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'paragraph'}
      >
        <option value="paragraph">Normal Text</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <Divider />

      {/* Inline Marks */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={FiBold} title="Bold" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={FiItalic} title="Italic" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={FiUnderline} title="Underline" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={FaStrikethrough} title="Strikethrough" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} icon={FaHighlighter} title="Highlight" />
      <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} icon={FiDelete} title="Clear Formatting" />

      <Divider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={FiAlignLeft} title="Align Left" />
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={FiAlignCenter} title="Align Center" />
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={FiAlignRight} title="Align Right" />

      <Divider />

      {/* Lists & Blocks */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={FiList} title="Bullet List" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={FaListOl} title="Numbered List" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={FaQuoteRight} title="Quote" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} icon={FiCode} title="Code Block" />

      <Divider />

      {/* Media & Insertions */}
      <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} icon={FiLink} title="Add Link" />
      <ToolbarButton onClick={addImage} icon={FiImage} title="Insert Image" />
      <ToolbarButton onClick={addYoutube} icon={FiYoutube} title="Insert YouTube" />
      <ToolbarButton onClick={addTable} icon={FiTable} title="Insert Table" />
    </div>
  );
};

function BlogEditor({ blog, onClose, onSave }) {
  const [title, setTitle] = useState(blog?.title || '');
  const [category, setCategory] = useState(blog?.category || '');
  const [tags, setTags] = useState(blog?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [excerpt, setExcerpt] = useState(blog?.excerpt || '');
  const [featuredImage, setFeaturedImage] = useState(blog?.featured_image || '');
  const [status, setStatus] = useState(blog?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(blog?.is_featured || false);
  const [scheduledDate, setScheduledDate] = useState(blog?.scheduled_at || '');
  
  const [metaTitle, setMetaTitle] = useState(blog?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(blog?.meta_description || '');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Highlight,
      CodeBlock,
      Youtube,
    ],
    content: blog?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-blue max-w-[800px] mx-auto focus:outline-none min-h-[600px] py-10 px-4',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      const characters = text.length;
      setStats({ words, characters });
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/blogs/blog-categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await API.post('/content/admin/blogs/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (editor) editor.chain().focus().setImage({ src: res.data.url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title || !editor?.getHTML()) {
      alert('Please add a title and content');
      return;
    }

    setLoading(true);
    try {
      const blogData = {
        title,
        content: editor.getHTML(),
        excerpt: excerpt || editor.getText().substring(0, 200),
        category,
        tags,
        featured_image: featuredImage,
        status,
        is_featured: isFeatured,
        scheduled_at: scheduledDate || null,
        meta_title: metaTitle,         
        meta_description: metaDescription 
      };

      console.log('Sending blog data:', blogData);

      if (blog?.id) {
        await API.put(`/blogs/admin/blogs/${blog.id}`, blogData);
      } else {
        await API.post('/blogs/admin/blogs', blogData); 
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving blog:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to save blog: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-[#0a0a0c] text-white flex flex-col overflow-hidden font-sans"
    >
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0f1115]">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white">
            <FiX size={22} />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title..."
            className="bg-transparent border-none text-2xl font-bold focus:outline-none w-full max-w-2xl placeholder-gray-600"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 text-sm text-gray-400">
            <span className={`w-2 h-2 rounded-full ${status === 'published' ? 'bg-green-500' : status === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-gray-300 font-medium cursor-pointer"
            >
              <option value="draft" className="bg-[#1a1d24]">Draft</option>
              <option value="published" className="bg-[#1a1d24]">Published</option>
              <option value="scheduled" className="bg-[#1a1d24]">Scheduled</option>
            </select>
          </div>

          <button onClick={() => setShowPreview(true)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium">
            <FiEye size={16} /> Preview
          </button>

          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 flex items-center gap-2 text-sm">
            <FiSave size={16} /> {loading ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0c]">
          {editor && <MenuBar editor={editor} />}
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <EditorContent editor={editor} />
          </div>

          <div className="border-t border-white/10 bg-[#0f1115] p-2 text-xs text-gray-400 flex justify-between px-6">
            <div className="flex gap-4">
              <span>{stats.words} words</span>
              <span>{stats.characters} characters</span>
            </div>
            <span>{Math.max(1, Math.ceil(stats.words / 200))} min read</span>
          </div>
        </div>

        <div className="w-[340px] border-l border-white/10 bg-[#0f1115] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className="p-6 space-y-8">
            
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Publishing</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1a1d24] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#1a1d24] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-[#1a1d24] border border-white/10 rounded-lg cursor-pointer hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500/50 bg-black/50"
                  />
                  <span className="text-sm font-medium">Feature this post</span>
                </label>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Media & Tags</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Featured Image</label>
                  {featuredImage && (
                    <div className="relative mb-2 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={featuredImage} alt="Cover" className="w-full h-32 object-cover" />
                      <button onClick={() => setFeaturedImage('')} className="absolute top-2 right-2 p-1 bg-black/50 rounded hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100">
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                    <FiUpload className="mb-2 text-gray-400" size={20} />
                    <span className="text-sm text-gray-400">Click to upload cover</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="Or paste image URL"
                    className="mt-2 w-full bg-[#1a1d24] border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-blue-500 text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Tags</label>
                  <div className="bg-[#1a1d24] border border-white/10 rounded-lg p-2 focus-within:border-blue-500 transition-colors">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/10 rounded-md text-xs flex items-center gap-1">
                          {tag}
                          <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-400 text-gray-400"><FiX size={12}/></button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-gray-500 px-1"
                      placeholder="Type and press Enter..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">SEO Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Excerpt (Short Summary)</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows="3"
                    className="w-full bg-[#1a1d24] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Appears on blog lists..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full bg-[#1a1d24] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="SEO Title (Optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows="2"
                    className="w-full bg-[#1a1d24] border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="SEO Description (Optional)"
                  />
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#1a1d24]">
              <h2 className="text-lg font-semibold text-gray-200">Article Preview</h2>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white text-black">
              {featuredImage && (
                <img src={featuredImage} alt={title} className="w-full max-h-[400px] object-cover rounded-xl mb-8 shadow-sm" />
              )}
              <h1 className="text-4xl font-extrabold mb-6 text-gray-900">{title || 'Untitled Article'}</h1>
              
              <div className="prose prose-lg max-w-none text-gray-800">
                <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '<p>No content yet...</p>' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default BlogEditor;