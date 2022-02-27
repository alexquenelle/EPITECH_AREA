import React from 'react';
import _ from 'lodash';
import RGL, { WidthProvider } from 'react-grid-layout';
import { Key } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { CardTest } from '../../../packages/ui/CardTest';
import { Widgets } from '@mui/icons-material';
import { getClient } from '../utils/ApiClient';
import { mdiConsoleLine } from '@mdi/js';

let ResponsiveReactGridLayout = WidthProvider(RGL);

const ShowcaseLayout = (props: { widgetsAdded: any; deleteWidget: any }) => {
    const generateDOM = () => {
        return _.map(generateLayout(), function (l: any, i: Key) {
            return (
                // <div>
                <div key={i}>
                    {l.widgetType} + {l.widgetService} + {l.widgetKey}
                    <CardTest deleteWidget={props.deleteWidget} widgetKey={l.widgetKey} />
                </div>
                // </div>
            );
        });
    };

    function generateLayout() {
        return _.map(_.range(0, props.widgetsAdded.length), function (i) {
            return {
                x: props.widgetsAdded[i].x,
                y: props.widgetsAdded[i].y,
                w: props.widgetsAdded[i].width,
                h: props.widgetsAdded[i].height,
                widgetType: props.widgetsAdded[i].type,
                widgetService: props.widgetsAdded[i].serviceid,
                widgetKey: props.widgetsAdded[i].id,
                i: i.toString(),
            };
        });
    }

    const onLayoutChange = (layout: any) => {
        layout.forEach(function (item: any, index: any) {
            props.widgetsAdded[index].x = item.x;
            props.widgetsAdded[index].y = item.y;
            props.widgetsAdded[index].height = item.h;
            props.widgetsAdded[index].width = item.w;
        });
        console.log(props.widgetsAdded);
        getClient()
            .widget.updateBulk(props.widgetsAdded)
            .then((data) => console.log(data));
    };

    return (
        <ResponsiveReactGridLayout
            layout={generateLayout()}
            onLayoutChange={onLayoutChange}
            // isResizable={false}
            compactType={'vertical'}
            preventCollision={!'vertical'}>
            {generateDOM()}
        </ResponsiveReactGridLayout>
    );
};

export default ShowcaseLayout;
