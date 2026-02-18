import React from 'react';
import { OceanLeaderboardEntry } from '../types';

export const OceanLeaderboard = ({ entry }: { entry: OceanLeaderboardEntry }) => {
    return <div>{entry.score}</div>;
};
