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

import {
    Column,
    useExpanded,
    usePagination,
    useRowSelect,
    useTable,
} from 'react-table';

import {JobType, TaskType} from '@/types';
import {logDebug} from '@/utils/log';
import {mmComponent, timeToStr} from '@/utils/utils';
import {useAppDispatch} from '@/hooks';

import Panel from '@/components/panel';
import {fetchRemoveJob, fetchStatusJob} from '@/reducers/jobSlice';
import Status from '@/components/status';

import ModifyJobForm from './ModifyJobForm';
interface Props {
    task: TaskType;
    entities: JobType[];
    editable: boolean;
}

export default function Table({task, entities, editable = true}: Props) {
    const dispatch = useAppDispatch();

    const handdleStatusToggle = useCallback(
        (job: JobType) => () => {
            if (task && editable) {
                dispatch(
                    fetchStatusJob({
                        taskId: task.taskId,
                        jobId: job.jobId,
                        jobStatus: job.jobStatus === 'open' ? 'done' : 'open',
                    }),
                );
            }
        },
        [dispatch, editable, task],
    );

    const handdleJobDeleteClick = useCallback(
        (job: JobType) => () => {
            logDebug(job + ' Delete');

            dispatch(fetchRemoveJob({taskId: task.taskId, jobId: job.jobId}));
        },
        [dispatch, task.taskId],
    );

    const columns = useMemo<Column<JobType>[]>(
        () => [
            {
                Header: '#',
                accessor: 'num',
                maxWidth: 50,
            },
            {
                Header: 'Title',
                accessor: 'jobTitle',
                Cell: ({cell: {value}}) => mmComponent(value),
            },
            {
                Header: 'Content',
                accessor: 'jobContent',
                Cell: ({cell: {value}}) => mmComponent(value),
            },
            {
                Header: 'Status',
                accessor: 'jobStatus',
                Cell: ({row: {original}, cell: {value}}) => {
                    return (
                        <Status
                            status={value}
                            onEventCallback={handdleStatusToggle(original)}
                        />
                    );
                },
            },
            {
                Header: 'User',
                accessor: 'userName',
                Cell: ({cell: {value}}) => mmComponent(value),
            },
            {
                Header: 'Created At',
                accessor: 'createAt',
                Cell: ({cell: {value}}) => timeToStr(value),
                maxWidth: 150,
            },
        ],
        [handdleStatusToggle],
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
        usePagination,
        useRowSelect,
        useExpanded,
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
                                    onClick={handdleJobDeleteClick(
                                        row.original,
                                    )}
                                >
                                    <Glyphicon glyph='trash' />
                                </Button>
                            </ButtonToolbar>
                        );
                    },
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
                                <th {...column.getHeaderProps()}>
                                    {column.render('Header')}
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
                                            <Panel headerTitle='할일을 수정 합니다.'>
                                                <ModifyJobForm
                                                    task={task}
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
