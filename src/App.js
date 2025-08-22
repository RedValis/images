import React, { useState, useEffect } from 'react';
import { Search, Download, ExternalLink, FileImage, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedImage, setSelectedImage] = useState(null);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const getImageTitle = (filename) => {
    return filename
      .replace(/\.[^/.]+$/, '') 
      .replace(/[-_]/g, ' ') 
      .replace(/\b\w/g, l => l.toUpperCase()); 
  };

  const getImageInfo = async (imagePath) => {
    try {
      const response = await fetch(imagePath, { method: 'HEAD' });
      const lastModified = response.headers.get('last-modified');
      const contentLength = response.headers.get('content-length');
      
      return {
        date: lastModified ? new Date(lastModified).toLocaleDateString() : new Date().toLocaleDateString(),
        size: contentLength ? Math.round(contentLength / 1024) + ' KB' : 'Unknown'
      };
    } catch (error) {
      return {
        date: new Date().toLocaleDateString(),
        size: 'Unknown'
      };
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const imagePromises = [];
        

        const imageFilenames = [
              'anicat.png',
              'anisigned.png',
              'Catmessiahniko.jpg',
              'gobbler_valis_and_arc.jpg',
        ];

        if (imageFilenames.length === 0) {
          const commonNames = [
            'image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg',
            'photo1.png', 'photo2.png', 'photo3.png',
            'pic1.jpeg', 'pic2.jpeg', 'pic3.jpeg'
          ];
          
          // Test which images exist
          for (let i = 0; i < commonNames.length; i++) {
            const filename = commonNames[i];
            const imagePath = `public/database/${filename}`;
            
            try {
              const response = await fetch(imagePath, { method: 'HEAD' });
              if (response.ok) {
                const info = await getImageInfo(imagePath);
                imagePromises.push({
                  id: i + 1,
                  src: imagePath,
                  alt: getImageTitle(filename),
                  title: getImageTitle(filename),
                  filename: filename,
                  ...info
                });
              }
            } catch (error) {
              // Image doesn't exist, skip it
              continue;
            }
          }
        } else {
          for (let i = 0; i < imageFilenames.length; i++) {
            const filename = imageFilenames[i];
            const imagePath = `/images/${filename}`;
            const info = await getImageInfo(imagePath);
            
            imagePromises.push({
              id: i + 1,
              src: imagePath,
              alt: getImageTitle(filename),
              title: getImageTitle(filename),
              filename: filename,
              ...info
            });
          }
        }

        setImages(imagePromises);
        setFilteredImages(imagePromises);
      } catch (error) {
        console.error('Error loading images:', error);
        setImages([]);
        setFilteredImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Filter images based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = images.filter(img => 
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredImages(filtered);
    } else {
      setFilteredImages(images);
    }
  }, [searchTerm, images]);

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    if (!selectedImage || isTransitioning) return;
    
    setIsTransitioning(true);
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let nextIndex;
    
    if (direction === 'next') {
      nextIndex = currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    }
    
    setTimeout(() => {
      setSelectedImage(filteredImages[nextIndex]);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;
      
      if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, filteredImages, isTransitioning]);

  const downloadImage = (src, title) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Image Gallery
              </h1>
              <p className="text-gray-300">
                {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* View Toggle */}
              <div className="flex bg-white/10 rounded-lg border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <FileImage className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-400 mb-2">No images found</p>
            <p className="text-gray-500">
              {images.length === 0 
                ? "Add images to the 'public/images' folder and update the imageFilenames array in the code"
                : "Try adjusting your search term"
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => openModal(image)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <FileImage className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <h3 className="text-white font-semibold text-lg mb-1 truncate">
                      {image.title}
                    </h3>
                    <p className="text-gray-300 text-sm">{image.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                onClick={() => openModal(image)}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="text-gray-400"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg></div>';
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {image.title}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm">Filename: {image.filename}</p>
                      <p className="text-gray-400 text-sm">Size: {image.size}</p>
                      <p className="text-gray-400 text-sm">Date: {image.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
          {/* Navigation Arrows - Outside Modal */}
          {filteredImages.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={() => navigateImage('prev')}
                disabled={isTransitioning}
                className="fixed left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-[70] w-12 h-12 sm:w-14 sm:h-14 bg-black/80 hover:bg-black/90 disabled:bg-black/50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 group border border-white/20 hover:border-purple-500/50 hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => navigateImage('next')}
                disabled={isTransitioning}
                className="fixed right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-[70] w-12 h-12 sm:w-14 sm:h-14 bg-black/80 hover:bg-black/90 disabled:bg-black/50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 group border border-white/20 hover:border-purple-500/50 hover:scale-105"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}
          
          <div className={`relative max-w-5xl w-full max-h-[90vh] bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden mx-4 transition-all duration-300 ${isTransitioning ? 'opacity-70 scale-95' : 'opacity-100 scale-100'} z-[60]`}>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-xl"
            >
              ×
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
              {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
            </div>
            
            <div className="flex flex-col lg:flex-row">
              <div className="flex-grow flex items-center justify-center p-4">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className={`max-w-full max-h-[70vh] object-contain rounded-lg transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                />
              </div>
              
              <div className="lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {selectedImage.title}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">File Info</h3>
                    <div className="space-y-2">
                      <p className="text-white text-sm">
                        <span className="text-gray-400">Filename:</span> {selectedImage.filename}
                      </p>
                      <p className="text-white text-sm">
                        <span className="text-gray-400">Size:</span> {selectedImage.size}
                      </p>
                      <p className="text-white text-sm">
                        <span className="text-gray-400">Date:</span> {selectedImage.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => downloadImage(selectedImage.src, selectedImage.title)}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => window.open(selectedImage.src, '_blank')}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                  </div>

                  {/* Navigation Hint */}
                  {filteredImages.length > 1 && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-xs text-center">
                        Use ← → arrow keys or click arrows to navigate
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;