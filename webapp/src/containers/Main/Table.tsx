/* eslint-disable operator-linebreak */
/* eslint-disable multiline-ternary */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
import React, {useCallback, useMemo} from 'react';

import {
    Button,
    ButtonToolbar,
    Col,
    DropdownButton,
    Glyphicon,
    Grid,
    MenuItem,
    Pagination,
    Table as RBTable,
    Row,
} from 'react-bootstrap';

import {Channel} from 'mattermost-redux/types/channels';
import {
    Column,
    useExpanded,
    usePagination,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table';

import {TaskType} from '@/types';
import {logDebug} from '@/utils/log';
import {mmComponent, timeToStr} from '@/utils/utils';
import {useAppDispatch} from '@/hooks';
import {setStep} from '@/reducers/globalSlice';
import {fetchDelteTask} from '@/reducers/taskSlice';

import Panel from '@/components/panel';

import ModifyTaskForm from './ModifyTaskForm';

interface Props {
    channel: Channel;
    entities: TaskType[];
    editable: boolean;
}

export default function Table({channel, entities, editable = true}: Props) {
    const dispatch = useAppDispatch();

    const handdleTaskIdClick = useCallback(
        (task: TaskType) => () => {
            dispatch(setStep({type: 'job', task}));
        },
        [dispatch],
    );

    const handdleTaskDeleteClick = useCallback(
        (task: TaskType) => () => {
            logDebug(task + ' Delete');
            dispatch(
                fetchDelteTask({
                    channelId: channel.id,
                    taskId: task.taskId,
                }),
            );
        },
        [channel.id, dispatch],
    );

    const columns = useMemo<Column<TaskType>[]>(
        () => [
            {
                Header: '#',
                accessor: 'num',
                maxWidth: 50,
            },
            {
                Header: 'Title',
                accessor: 'taskTitle',
                Cell: ({row: {original}, cell: {value}}) => {
                    return (
                        <a onClick={handdleTaskIdClick(original)}>
                            {mmComponent(value)}
                        </a>
                    );
                },
                disableSortBy: true,
            },
            {
                Header: 'User',
                accessor: 'userName',
                Cell: ({cell: {value}}) => mmComponent(value),
                // Filter: selectColumnFilter,
                // filter: 'includes',
                disableSortBy: true,
            },
            {
                Header: 'Created At',
                accessor: 'createAt',
                Cell: ({cell: {value}}) => timeToStr(value),
                maxWidth: 150,
            },
        ],
        [handdleTaskIdClick],
    );

    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        headerGroups,
        rows,
        prepareRow,
        getTableBodyProps,
        visibleColumns,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: {pageIndex, pageSize},
    } = useTable(
        {
            columns,
            data: entities,
        },
        // useFilters,
        useSortBy,
        useExpanded,
        usePagination,
        useRowSelect,
        (hooks) => {
            hooks.visibleColumns.push((myColumns) => [
                ...myColumns,
                {
                    id: 'more',
                    Header: 'More',
                    Cell: ({row}) => {
                        return (
                            <ButtonToolbar disabled={!editable}>
                                <Button
                                    bsSize='xsmall'
                                    {...row.getToggleRowExpandedProps()}
                                >
                                    {row.isExpanded ? (
                                        <Glyphicon glyph='remove' />
                                    ) : (
                                        <Glyphicon glyph='pencil' />
                                    )}
                                </Button>
                                <Button
                                    bsSize='xsmall'
                                    style={{
                                        color: 'darkred',
                                    }}
                                    onClick={handdleTaskDeleteClick(
                                        row.original,
                                    )}
                                >
                                    <Glyphicon glyph='trash' />
                                </Button>
                            </ButtonToolbar>
                        );
                    },
                    disableSortBy: true,
                },
            ]);
        },
    );

    return (
        <>
            <RBTable
                striped={true}
                bordered={true}
                hover={true}
                {...getTableProps()}
            >
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                // Add the sorting props to control sorting. For this example
                                // we can add them into the header props
                                <th
                                    {...column.getHeaderProps(
                                        column.getSortByToggleProps(),
                                    )}
                                >
                                    <React.Fragment>
                                        {column.render('Header')}
                                        {/* Add a sort direction indicator */}
                                        {column.canSort && (
                                            <span
                                                style={{
                                                    fontSize: 'xx-small',
                                                    marginLeft: '5px',
                                                }}
                                            >
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? (
                                                        <Glyphicon glyph='sort-by-attributes-alt' />
                                                    ) : (
                                                        <Glyphicon glyph='sort-by-attributes' />
                                                    )
                                                ) : (
                                                    <Glyphicon glyph='sort' />
                                                )}
                                            </span>
                                        )}
                                        {/* <div>
                                            {column.canFilter
                                                ? column.render('Filter')
                                                : null}
                                        </div> */}
                                        {/* {column.canFilter && (
                                            <div>{column.render('Filter')}</div>
                                        )} */}
                                    </React.Fragment>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row);
                        return (
                            // Use a React.Fragment here so the table markup is still valid
                            <React.Fragment {...row.getRowProps()}>
                                <tr>
                                    {row.cells.map((cell) => {
                                        return (
                                            <td {...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </td>
                                        );
                                    })}
                                </tr>
                                {row.isExpanded ? (
                                    <tr>
                                        <td colSpan={visibleColumns.length}>
                                            <Panel headerTitle='작업을 수정 합니다.'>
                                                <ModifyTaskForm
                                                    channel={channel}
                                                    row={row}
                                                />
                                            </Panel>
                                        </td>
                                    </tr>
                                ) : null}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </RBTable>
            <Grid
                style={{
                    width: 'auto',
                }}
            >
                <Row className='show-grid'>
                    <Col md={4} xs={4}>
                        <Pagination bsSize='small' style={{margin: '0px'}}>
                            <Pagination.First
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            />
                            <Pagination.Prev
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                            />
                            <Pagination.Next
                                onClick={() => nextPage()}
                                disabled={!canNextPage}
                            />
                            <Pagination.Last
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                            />
                        </Pagination>
                    </Col>
                    <Col
                        md={4}
                        xs={4}
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        <span>
                            {'Page '}
                            <strong>
                                {pageIndex + 1} {' of '} {pageOptions.length}
                            </strong>{' '}
                        </span>
                    </Col>
                    <Col
                        md={4}
                        xs={4}
                        style={{
                            textAlign: 'right',
                        }}
                    >
                        <DropdownButton
                            title={pageSize}
                            bsSize='small'
                            dropup={true}
                            pullRight={true}
                            onSelect={(eventKey) =>
                                setPageSize(Number(eventKey))
                            }
                            id={'dropdown-page-size'}
                        >
                            <MenuItem eventKey={10}>{'10'}</MenuItem>
                            <MenuItem eventKey={20}>{'20'}</MenuItem>
                            <MenuItem eventKey={30}>{'30'}</MenuItem>
                            <MenuItem eventKey={40}>{'40'}</MenuItem>
                            <MenuItem eventKey={50}>{'50'}</MenuItem>
                        </DropdownButton>
                    </Col>
                </Row>
            </Grid>
        </>
    );
}
