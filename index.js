const TorrentStream = require('torrent-stream');
const ParseTorrent = require('parse-torrent');

const DEFAULT_PORT = 6881;

/**
 * Convert magnet to torrent buffer
 *
 * @class Magnet2torrent
 */
class Magnet2torrent {
	/**
	 * Creates an instance of Magnet2torrent.
	 * @param {*} [options={}] Options
	 * @memberof Magnet2torrent
	 */
	constructor(options = {}) {
		let {
			trackers,
			addTrackersToTorrent,
			port
		} = options;

		this.trackers = trackers || [];
		this.attt = addTrackersToTorrent ? true : false;
		this.port = port || DEFAULT_PORT;

		if (!Array.isArray(this.trackers))
			throw new TypeError('announceList must be an array');
		for (let tracker of this.trackers) {
			if (typeof tracker != 'string')
				throw new TypeError('member of announceList must be string');
		}

	}

	/**
	 * Convert magnet to torrent buffer
	 *
	 * @param {string} magnet Magnet link
	 * @returns
	 * @memberof Magnet2torrent
	 */
	getTorrentBuffer(magnet) {
		return new Promise(resolve => {
			const engine = TorrentStream(magnet, {
				trackers: this.trackers,
				port: this.port
			});

			engine.on('torrent', torrent => {
				engine.destroy();
				if (this.attt && this.trackers.length > 0) {
					torrent.announce = [];
					torrent.announceList = [
						[].concat(this.trackers)
					];
				}
				resolve(ParseTorrent.toTorrentFile(torrent));
			});
		});
	}
}

module.exports = Magnet2torrent;
