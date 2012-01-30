<?php
    /*
     * Support for subsettings fonts, code borrowed from the TCPDF project.
     *
     * The TCPDF project is distributed under the GNU Lesser General Public License
     * version 3 as published by the Free Software Foundation.
     */


	/**
	 * Returns a subset of the TrueType font data without the unused glyphs.
	 * @param $font (string) TrueType font data.
	 * @param $subsetchars (array) Array of used characters (the glyphs to keep).
	 * @return (string) A subset of TrueType font data without the unused glyphs.
	 * @author Nicola Asuni
	 * @protected
	 * @since 5.2.000 (2010-06-02)
	 */
	function _getTrueTypeFontSubset($font, $subsetchars) {
		ksort($subsetchars);
		$offset = 0; // offset position of the font data
		if (_getULONG($font, $offset) != 0x10000) {
			// sfnt version must be 0x00010000 for TrueType version 1.0.
			return $font;
		}
		$offset += 4;
		// get number of tables
		$numTables = _getUSHORT($font, $offset);
		$offset += 2;
		// skip searchRange, entrySelector and rangeShift
		$offset += 6;
		// tables array
		$table = array();
		// for each table
		for ($i = 0; $i < $numTables; ++$i) {
			// get table info
			$tag = substr($font, $offset, 4);
			$offset += 4;
			$table[$tag] = array();
			$table[$tag]['checkSum'] = _getULONG($font, $offset);
			$offset += 4;
			$table[$tag]['offset'] = _getULONG($font, $offset);
			$offset += 4;
			$table[$tag]['length'] = _getULONG($font, $offset);
			$offset += 4;
		}
		// check magicNumber
		$offset = $table['head']['offset'] + 12;
		if (_getULONG($font, $offset) != 0x5F0F3CF5) {
			// magicNumber must be 0x5F0F3CF5
			return $font;
		}
		$offset += 4;
		// get offset mode (indexToLocFormat : 0 = short, 1 = long)
		$offset = $table['head']['offset'] + 50;
		$short_offset = (_getSHORT($font, $offset) == 0);
		$offset += 2;
		// get the offsets to the locations of the glyphs in the font, relative to the beginning of the glyphData table
		$indexToLoc = array();
		$offset = $table['loca']['offset'];
		if ($short_offset) {
			// short version
			$tot_num_glyphs = ($table['loca']['length'] / 2); // numGlyphs + 1
			for ($i = 0; $i < $tot_num_glyphs; ++$i) {
				$indexToLoc[$i] = _getUSHORT($font, $offset) * 2;
				$offset += 2;
			}
		} else {
			// long version
			$tot_num_glyphs = ($table['loca']['length'] / 4); // numGlyphs + 1
			for ($i = 0; $i < $tot_num_glyphs; ++$i) {
				$indexToLoc[$i] = _getULONG($font, $offset);
				$offset += 4;
			}
		}
		// get glyphs indexes of chars from cmap table
		$subsetglyphs = array(); // glyph IDs on key
		$subsetglyphs[0] = true; // character codes that do not correspond to any glyph in the font should be mapped to glyph index 0
		$offset = $table['cmap']['offset'] + 2;
		$numEncodingTables = _getUSHORT($font, $offset);
		$offset += 2;
		$encodingTables = array();
		for ($i = 0; $i < $numEncodingTables; ++$i) {
			$encodingTables[$i]['platformID'] = _getUSHORT($font, $offset);
			$offset += 2;
			$encodingTables[$i]['encodingID'] = _getUSHORT($font, $offset);
			$offset += 2;
			$encodingTables[$i]['offset'] = _getULONG($font, $offset);
			$offset += 4;
		}
		foreach ($encodingTables as $enctable) {
			if (($enctable['platformID'] == 3) AND ($enctable['encodingID'] == 0)) {
				$modesymbol = true;
			} else {
				$modesymbol = false;
			}
			$offset = $table['cmap']['offset'] + $enctable['offset'];
			$format = _getUSHORT($font, $offset);
			$offset += 2;
			switch ($format) {
				case 0: { // Format 0: Byte encoding table
					$offset += 4; // skip length and version/language
					for ($c = 0; $c < 256; ++$c) {
						if (isset($subsetchars[$c])) {
							$g = _getBYTE($font, $offset);
							$subsetglyphs[$g] = true;
						}
						++$offset;
					}
					break;
				}
				case 2: { // Format 2: High-byte mapping through table
					$offset += 4; // skip length and version/language
					$numSubHeaders = 0;
					for ($i = 0; $i < 256; ++$i) {
						// Array that maps high bytes to subHeaders: value is subHeader index * 8.
						$subHeaderKeys[$i] = (_getUSHORT($font, $offset) / 8);
						$offset += 2;
						if ($numSubHeaders < $subHeaderKeys[$i]) {
							$numSubHeaders = $subHeaderKeys[$i];
						}
					}
					// the number of subHeaders is equal to the max of subHeaderKeys + 1
					++$numSubHeaders;
					// read subHeader structures
					$subHeaders = array();
					$numGlyphIndexArray = 0;
					for ($k = 0; $k < $numSubHeaders; ++$k) {
						$subHeaders[$k]['firstCode'] = _getUSHORT($font, $offset);
						$offset += 2;
						$subHeaders[$k]['entryCount'] = _getUSHORT($font, $offset);
						$offset += 2;
						$subHeaders[$k]['idDelta'] = _getSHORT($font, $offset);
						$offset += 2;
						$subHeaders[$k]['idRangeOffset'] = _getUSHORT($font, $offset);
						$offset += 2;
						$subHeaders[$k]['idRangeOffset'] -= (2 + (($numSubHeaders - $k - 1) * 8));
						$subHeaders[$k]['idRangeOffset'] /= 2;
						$numGlyphIndexArray += $subHeaders[$k]['entryCount'];
					}
					for ($k = 0; $k < $numGlyphIndexArray; ++$k) {
						$glyphIndexArray[$k] = _getUSHORT($font, $offset);
						$offset += 2;
					}
					for ($i = 0; $i < 256; ++$i) {
						$k = $subHeaderKeys[$i];
						if ($k == 0) {
							// one byte code
							$c = $i;
							if (isset($subsetchars[$c])) {
								$g = $glyphIndexArray[0];
								$subsetglyphs[$g] = true;
							}
						} else {
							// two bytes code
							$start_byte = $subHeaders[$k]['firstCode'];
							$end_byte = $start_byte + $subHeaders[$k]['entryCount'];
							for ($j = $start_byte; $j < $end_byte; ++$j) {
								// combine high and low bytes
								$c = (($i << 8) + $j);
								if (isset($subsetchars[$c])) {
									$idRangeOffset = ($subHeaders[$k]['idRangeOffset'] + $j - $subHeaders[$k]['firstCode']);
									$g = $glyphIndexArray[$idRangeOffset];
									$g += ($idDelta[$k] - 65536);
									if ($g < 0) {
										$g = 0;
									}
									$subsetglyphs[$g] = true;
								}
							}
						}
					}
					break;
				}
				case 4: { // Format 4: Segment mapping to delta values
					$length = _getUSHORT($font, $offset);
					$offset += 2;
					$offset += 2; // skip version/language
					$segCount = (_getUSHORT($font, $offset) / 2);
					$offset += 2;
					$offset += 6; // skip searchRange, entrySelector, rangeShift
					$endCount = array(); // array of end character codes for each segment
					for ($k = 0; $k < $segCount; ++$k) {
						$endCount[$k] = _getUSHORT($font, $offset);
						$offset += 2;
					}
					$offset += 2; // skip reservedPad
					$startCount = array(); // array of start character codes for each segment
					for ($k = 0; $k < $segCount; ++$k) {
						$startCount[$k] = _getUSHORT($font, $offset);
						$offset += 2;
					}
					$idDelta = array(); // delta for all character codes in segment
					for ($k = 0; $k < $segCount; ++$k) {
						$idDelta[$k] = _getUSHORT($font, $offset);
						$offset += 2;
					}
					$idRangeOffset = array(); // Offsets into glyphIdArray or 0
					for ($k = 0; $k < $segCount; ++$k) {
						$idRangeOffset[$k] = _getUSHORT($font, $offset);
						$offset += 2;
					}
					$gidlen = ($length / 2) - 8 - (4 * $segCount);
					$glyphIdArray = array(); // glyph index array
					for ($k = 0; $k < $gidlen; ++$k) {
						$glyphIdArray[$k] = _getUSHORT($font, $offset);
						$offset += 2;
					}
					for ($k = 0; $k < $segCount; ++$k) {
						for ($c = $startCount[$k]; $c <= $endCount[$k]; ++$c) {
							if (isset($subsetchars[$c])) {
								if ($idRangeOffset[$k] == 0) {
									$g = $c;
								} else {
									$gid = (($idRangeOffset[$k] / 2) + ($c - $startCount[$k]) - ($segCount - $k));
									$g = $glyphIdArray[$gid];
								}
								$g += ($idDelta[$k] - 65536);
								if ($g < 0) {
									$g = 0;
								}
								$subsetglyphs[$g] = true;
							}
						}
					}
					break;
				}
				case 6: { // Format 6: Trimmed table mapping
					$offset += 4; // skip length and version/language
					$firstCode = _getUSHORT($font, $offset);
					$offset += 2;
					$entryCount = _getUSHORT($font, $offset);
					$offset += 2;
					for ($k = 0; $k < $entryCount; ++$k) {
						$c = ($k + $firstCode);
						if (isset($subsetchars[$c])) {
							$g = _getUSHORT($font, $offset);
							$subsetglyphs[$g] = true;
						}
						$offset += 2;
					}
					break;
				}
				case 8: { // Format 8: Mixed 16-bit and 32-bit coverage
					$offset += 10; // skip reserved, length and version/language
					for ($k = 0; $k < 8192; ++$k) {
						$is32[$k] = _getBYTE($font, $offset);
						++$offset;
					}
					$nGroups = _getULONG($font, $offset);
					$offset += 4;
					for ($i = 0; $i < $nGroups; ++$i) {
						$startCharCode = _getULONG($font, $offset);
						$offset += 4;
						$endCharCode = _getULONG($font, $offset);
						$offset += 4;
						$startGlyphID = _getULONG($font, $offset);
						$offset += 4;
						for ($k = $startCharCode; $k <= $endCharCode; ++$k) {
							$is32idx = floor($c / 8);
							if ((isset($is32[$is32idx])) AND (($is32[$is32idx] & (1 << (7 - ($c % 8)))) == 0)) {
								$c = $k;
							} else {
								// 32 bit format
								// convert to decimal (http://www.unicode.org/faq//utf_bom.html#utf16-4)
								//LEAD_OFFSET = (0xD800 - (0x10000 >> 10)) = 55232
								//SURROGATE_OFFSET = (0x10000 - (0xD800 << 10) - 0xDC00) = -56613888
								$c = ((55232 + ($k >> 10)) << 10) + (0xDC00 + ($k & 0x3FF)) -56613888;
							}
							if (isset($subsetchars[$c])) {
								$subsetglyphs[$startGlyphID] = true;
							}
							++$startGlyphID;
						}
					}
					break;
				}
				case 10: { // Format 10: Trimmed array
					$offset += 10; // skip reserved, length and version/language
					$startCharCode = _getULONG($font, $offset);
					$offset += 4;
					$numChars = _getULONG($font, $offset);
					$offset += 4;
					for ($k = 0; $k < $numChars; ++$k) {
						$c = ($k + $startCharCode);
						if (isset($subsetchars[$c])) {
							$g = _getUSHORT($font, $offset);
							$subsetglyphs[$g] = true;
						}
						$offset += 2;
					}
					break;
				}
				case 12: { // Format 12: Segmented coverage
					$offset += 10; // skip length and version/language
					$nGroups = _getULONG($font, $offset);
					$offset += 4;
					for ($k = 0; $k < $nGroups; ++$k) {
						$startCharCode = _getULONG($font, $offset);
						$offset += 4;
						$endCharCode = _getULONG($font, $offset);
						$offset += 4;
						$startGlyphCode = _getULONG($font, $offset);
						$offset += 4;
						for ($c = $startCharCode; $c <= $endCharCode; ++$c) {
							if (isset($subsetchars[$c])) {
								$subsetglyphs[$startGlyphCode] = true;
							}
							++$startGlyphCode;
						}
					}
					break;
				}
				case 13: { // Format 13: Many-to-one range mappings
					// to be implemented ...
					break;
				}
				case 14: { // Format 14: Unicode Variation Sequences
					// to be implemented ...
					break;
				}
			}
		}
		// include all parts of composite glyphs
		$new_sga = $subsetglyphs;
		while (!empty($new_sga)) {
			$sga = $new_sga;
			$new_sga = array();
			foreach ($sga as $key => $val) {
				if (isset($indexToLoc[$key])) {
					$offset = ($table['glyf']['offset'] + $indexToLoc[$key]);
					$numberOfContours = _getSHORT($font, $offset);
					$offset += 2;
					if ($numberOfContours < 0) { // composite glyph
						$offset += 8; // skip xMin, yMin, xMax, yMax
						do {
							$flags = _getUSHORT($font, $offset);
							$offset += 2;
							$glyphIndex = _getUSHORT($font, $offset);
							$offset += 2;
							if (!isset($subsetglyphs[$glyphIndex])) {
								// add missing glyphs
								$new_sga[$glyphIndex] = true;
							}
							// skip some bytes by case
							if ($flags & 1) {
								$offset += 4;
							} else {
								$offset += 2;
							}
							if ($flags & 8) {
								$offset += 2;
							} elseif ($flags & 64) {
								$offset += 4;
							} elseif ($flags & 128) {
								$offset += 8;
							}
						} while ($flags & 32);
					}
				}
			}
			$subsetglyphs += $new_sga;
		}
		// sort glyphs by key (and remove duplicates)
		ksort($subsetglyphs);
		// build new glyf and loca tables
		$glyf = '';
		$loca = '';
		$offset = 0;
		$glyf_offset = $table['glyf']['offset'];
		for ($i = 0; $i < $tot_num_glyphs; ++$i) {
			if (isset($subsetglyphs[$i])) {
				$length = ($indexToLoc[($i + 1)] - $indexToLoc[$i]);
				$glyf .= substr($font, ($glyf_offset + $indexToLoc[$i]), $length);
			} else {
				$length = 0;
			}
			if ($short_offset) {
				$loca .= pack('n', ($offset / 2));
			} else {
				$loca .= pack('N', $offset);
			}
			$offset += $length;
		}
		// array of table names to preserve (loca and glyf tables will be added later)
		// the cmap table is not needed and shall not be present, since the mapping from character codes to glyph descriptions is provided separately
		$table_names = array ('head', 'hhea', 'hmtx', 'maxp', 'cvt ', 'fpgm', 'prep'); // minimum required table names
		// get the tables to preserve
		$offset = 12;
		foreach ($table as $tag => $val) {
			if (in_array($tag, $table_names)) {
				$table[$tag]['data'] = substr($font, $table[$tag]['offset'], $table[$tag]['length']);
				if ($tag == 'head') {
					// set the checkSumAdjustment to 0
					$table[$tag]['data'] = substr($table[$tag]['data'], 0, 8)."\x0\x0\x0\x0".substr($table[$tag]['data'], 12);
				}
				$pad = 4 - ($table[$tag]['length'] % 4);
				if ($pad != 4) {
					// the length of a table must be a multiple of four bytes
					$table[$tag]['length'] += $pad;
					$table[$tag]['data'] .= str_repeat("\x0", $pad);
				}
				$table[$tag]['offset'] = $offset;
				$offset += $table[$tag]['length'];
				// check sum is not changed (so keep the following line commented)
				//$table[$tag]['checkSum'] = _getTTFtableChecksum($table[$tag]['data'], $table[$tag]['length']);
			} else {
				unset($table[$tag]);
			}
		}
		// add loca
		$table['loca']['data'] = $loca;
		$table['loca']['length'] = strlen($loca);
		$pad = 4 - ($table['loca']['length'] % 4);
		if ($pad != 4) {
			// the length of a table must be a multiple of four bytes
			$table['loca']['length'] += $pad;
			$table['loca']['data'] .= str_repeat("\x0", $pad);
		}
		$table['loca']['offset'] = $offset;
		$table['loca']['checkSum'] = _getTTFtableChecksum($table['loca']['data'], $table['loca']['length']);
		$offset += $table['loca']['length'];
		// add glyf
		$table['glyf']['data'] = $glyf;
		$table['glyf']['length'] = strlen($glyf);
		$pad = 4 - ($table['glyf']['length'] % 4);
		if ($pad != 4) {
			// the length of a table must be a multiple of four bytes
			$table['glyf']['length'] += $pad;
			$table['glyf']['data'] .= str_repeat("\x0", $pad);
		}
		$table['glyf']['offset'] = $offset;
		$table['glyf']['checkSum'] = _getTTFtableChecksum($table['glyf']['data'], $table['glyf']['length']);
		// rebuild font
		$font = '';
		$font .= pack('N', 0x10000); // sfnt version
		$numTables = count($table);
		$font .= pack('n', $numTables); // numTables
		$entrySelector = floor(log($numTables, 2));
		$searchRange = pow(2, $entrySelector) * 16;
		$rangeShift = ($numTables * 16) - $searchRange;
		$font .= pack('n', $searchRange); // searchRange
		$font .= pack('n', $entrySelector); // entrySelector
		$font .= pack('n', $rangeShift); // rangeShift
		$offset = ($numTables * 16);
		foreach ($table as $tag => $data) {
			$font .= $tag; // tag
			$font .= pack('N', $data['checkSum']); // checkSum
			$font .= pack('N', ($data['offset'] + $offset)); // offset
			$font .= pack('N', $data['length']); // length
		}
		foreach ($table as $data) {
			$font .= $data['data'];
		}
		// set checkSumAdjustment on head table
		$checkSumAdjustment = 0xB1B0AFBA - _getTTFtableChecksum($font, strlen($font));
		$font = substr($font, 0, $table['head']['offset'] + 8).pack('N', $checkSumAdjustment).substr($font, $table['head']['offset'] + 12);
		return $font;
	}

	/**
	 * Returs the checksum of a TTF table.
	 * @param $table (string) table to check
	 * @param $length (int) length of table in bytes
	 * @return int checksum
	 * @author Nicola Asuni
	 * @protected
	 * @since 5.2.000 (2010-06-02)
	 */
	function _getTTFtableChecksum($table, $length) {
		$sum = 0;
		$tlen = ($length / 4);
		$offset = 0;
		for ($i = 0; $i < $tlen; ++$i) {
			$v = unpack('Ni', substr($table, $offset, 4));
			$sum += $v['i'];
			$offset += 4;
		}
		$sum = unpack('Ni', pack('N', $sum));
		return $sum['i'];
	}
	
	/**
	 * Get ULONG from string (Big Endian 32-bit unsigned integer).
	 * @param $str (string) string from where to extract value
	 * @param $offset (int) point from where to read the data
	 * @return int 32 bit value
	 * @author Nicola Asuni
	 * @protected
	 * @since 5.2.000 (2010-06-02)
	 */
	function _getULONG($str, $offset) {
		$v = unpack('Ni', substr($str, $offset, 4));
		return $v['i'];
	}

	/**
	 * Get USHORT from string (Big Endian 16-bit unsigned integer).
	 * @param $str (string) string from where to extract value
	 * @param $offset (int) point from where to read the data
	 * @return int 16 bit value
	 * @author Nicola Asuni
	 * @protected
	 * @since 5.2.000 (2010-06-02)
	 */
	function _getUSHORT($str, $offset) {
		$v = unpack('ni', substr($str, $offset, 2));
		return $v['i'];
	}

	/**
	 * Get SHORT from string (Big Endian 16-bit signed integer).
	 * @param $str (string) string from where to extract value
	 * @param $offset (int) point from where to read the data
	 * @return int 16 bit value
	 * @author Nicola Asuni
	 * @protected
	 * @since 5.2.000 (2010-06-02)
	 */
	function _getSHORT($str, $offset) {
		$v = unpack('si', substr($str, $offset, 2));
		return $v['i'];
	}
	
	/**
	 * Get BYTE from string (8-bit unsigned integer).
	 * @param $str (string) String from where to extract value.
	 * @param $offset (int) Point from where to read the data.
	 * @return int 8 bit value
	 * @author Nicola Asuni
	 * @protected
	 * @since 5.2.000 (2010-06-02)
	 */
	function _getBYTE($str, $offset) {
		$v = unpack('Ci', substr($str, $offset, 1));
		return $v['i'];
	}

