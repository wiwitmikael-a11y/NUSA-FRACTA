import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const ImagePanel: React.FC = () => {
    const { currentChapter, currentNodeId } = useSelector((state: RootState) => state.game);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const node = currentChapter?.nodes.find(n => n.nodeId === currentNodeId);
        const newUrl = node?.imageUrl || null;

        if (newUrl !== imageUrl) {
            setIsLoading(true);
            setImageUrl(newUrl);
        }
    }, [currentNodeId, currentChapter, imageUrl]);

    const handleImageLoad = () => {
        setIsLoading(false);
    };
    
    const node = currentChapter?.nodes.find(n => n.nodeId === currentNodeId);

    if (!imageUrl) {
        return <div className="panel image-panel placeholder">{node?.location || ''}</div>;
    }

    return (
        <div className="panel image-panel">
            <img
                src={imageUrl}
                alt={node?.location || 'Scene image'}
                onLoad={handleImageLoad}
                className={isLoading ? 'loading' : 'loaded'}
            />
            {isLoading && <div className="spinner-overlay"><div className="spinner"></div></div>}
        </div>
    );
};

export default ImagePanel;
