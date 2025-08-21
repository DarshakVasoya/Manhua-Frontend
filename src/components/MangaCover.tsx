import React, { useState } from 'react';
import Image from 'next/image';
import styles from './MangaCover.module.css';

export interface Chapter {
	number: number;
	url: string;
	time: string;
}

export interface MangaCoverProps {
	title: string;
	imageUrl: string;
	mangaUrl: string;
	chapters: Chapter[];
	lastChapter?: string;
	rating?: number;
	index?: number;
	status?: string; // e.g. Ongoing / Completed
	tags?: string[]; // genre tags
}

const MangaCover: React.FC<MangaCoverProps> = ({
	title,
	imageUrl,
	mangaUrl,
	chapters,
	lastChapter,
	rating,
	index,
	status,
	tags = [],
}) => {
	const [loaded, setLoaded] = useState(false);
	return (
		<div className={styles.card}>
			<a href={mangaUrl} className={styles.imageLink} title={title}>
				<div className={styles.imageOuter}>  
					{!loaded && <div className={styles.skeleton} />}
					<div className={styles.imageWrapper}>
						<Image
							src={imageUrl}
							alt={title}
							fill
							sizes="(max-width:768px) 40vw, (max-width:1200px) 20vw, 320px"
							className={loaded ? styles.coverImg : styles.coverImgHidden}
							onLoad={() => setLoaded(true)}
							priority={index !== undefined && index < 8}
						/>
						<div className={styles.overlay}></div>
						<div className={styles.topBadges}>
							{typeof index === 'number' && (
								<span className={styles.badgeIndex}>#{index + 1}</span>
							)}
							{status && <span className={styles.badgeStatus}>{status}</span>}
						</div>
						<div className={styles.bottomBadges}>
							{rating !== undefined && <span className={styles.badgeRating}>⭐ {rating}</span>}
							{lastChapter && <span className={styles.badgeChapter}>Ch. {lastChapter}</span>}
						</div>
					</div>
				</div>
			</a>
			<div className={styles.info}>
				<a href={mangaUrl} className={styles.title} title={title}>{title}</a>
				{tags.length > 0 && (
					<div className={styles.tagsRow}>
						{tags.slice(0,3).map(t => (
							<span key={t} className={styles.tag}>{t}</span>
						))}
						{tags.length > 3 && <span className={styles.tagMore}>+{tags.length - 3}</span>}
					</div>
				)}
				{chapters.length > 0 && (
					<ul className={styles.chapters}>
						{chapters.slice(0,2).map((ch) => (
							<li key={ch.number}>
								<a href={ch.url} className={styles.chapterLink}>
									<span className={styles.chapterNum}>Ch. {ch.number}</span>
									<span className={styles.chapterTime}>{ch.time}</span>
								</a>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default MangaCover;
