const TimeTracking = require('../../models/timeTracking');
const mongoose = require('mongoose');

class TimeTrackingReportsController {
  /**
   * Employee Daily Log View
   * @param {Object} req - Request object with filters
   * @param {Object} res - Response object
   */
  async getEmployeeDailyLogs(req, res) {
    try {
      // fromDate and toDate should be in YYYY-MM-DD format
      const { dateFrom, dateTo, employeeId, projectId, taskId, projectType } = req.query;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({
          status: 400,
          message: 'Date range is required'
        });
      }

      const matchQuery = {
        startTime: { $gte: new Date(dateFrom), $lte: new Date(dateTo) }
      };

      if (employeeId) matchQuery.user = new mongoose.Types.ObjectId(employeeId);
      if (projectId) matchQuery.project = new mongoose.Types.ObjectId(projectId);
      if (taskId) matchQuery.task = new mongoose.Types.ObjectId(taskId);
      if (projectType && projectType.trim() !== '') matchQuery.projectType = projectType;

      const logs = await TimeTracking.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: '$userDetails' },
        {
          $lookup: {
            from: 'tasks',
            localField: 'task',
            foreignField: '_id',
            as: 'taskDetails'
          }
        },
        { $unwind: '$taskDetails' },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectDetails'
          }
        },
        { $unwind: '$projectDetails' },
        {
          $addFields: {
            currentEndTime: {
              $cond: {
                if: { $eq: ["$isActive", true] },
                then: "$$NOW",
                else: "$endTime"
              }
            },
            activePauseDuration: {
              $cond: {
                if: { $eq: ["$isPaused", true] },
                then: {
                  $subtract: ["$$NOW", { $last: "$pausePeriods.startTime" }]
                },
                else: 0
              }
            }
          }
        },
        {
          $addFields: {
            totalPauseTime: {
              $add: ["$totalPausedTime", "$activePauseDuration"]
            }
          }
        },
        {
          $project: {
            employeeName: '$userDetails.name',
            designation: '$userDetails.designation',
            taskTitle: '$taskDetails.summary',
            estimatedHours: '$taskDetails.estimatedTime',
            projectName: '$projectDetails.name',
            startTime: { $toDate: '$startTime' },
            endTime: { $toDate: '$currentEndTime' },
            totalLoggedTime: {
              $subtract: [
                { $toDate: '$currentEndTime' },
                { $add: [{ $toDate: '$startTime' }, '$totalPauseTime'] }
              ]
            },
            breakTime: '$totalPauseTime',
            taskStatus: '$taskDetails.status',
            description: 1,
            billable: 1,
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }
          }
        },
        {
          $project: {
            employeeName: 1,
            designation: 1,
            taskTitle: 1,
            estimatedHours: 1,
            projectName: 1,
            startTime: 1,
            endTime: 1,
            totalLoggedTimeHours: {
              $round: [{ $divide: ['$totalLoggedTime', 3600000] }, 2]
            },
            breakTimeHours: {
              $round: [{ $divide: ['$breakTime', 3600000] }, 2]
            },
            taskStatus: 1,
            description: 1,
            billable: 1,
            date: 1
          }
        },
        { $sort: { date: -1, startTime: -1 } }
      ]);

      res.status(200).json({
        status: 200,
        message: 'Employee daily logs retrieved successfully',
        data: logs
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status: 500,
        message: 'Error retrieving employee daily logs',
        error: error.message
      });
    }
  }

  /**
   * Monthly Summary by Employee
   * @param {Object} req - Request object with filters
   * @param {Object} res - Response object
   */
  async getMonthlyEmployeeSummary(req, res) {
    try {
      const { month, employeeId, projectType } = req.query;

      if (!month) {
        return res.status(400).json({
          status: 400,
          message: 'Month is required'
        });
      }

      // Parse month (format: YYYY-MM)
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      endDate.setHours(23, 59, 59, 999);

      const matchQuery = {
        startTime: { $gte: startDate, $lte: endDate },
        isComplete: true,
      };

      if (employeeId) matchQuery.user = new mongoose.Types.ObjectId(employeeId);
      if (projectType && projectType.trim() !== '') matchQuery.projectType = projectType;
      // Get all days in the month
      const daysInMonth = endDate.getDate();
      const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      const employeeLogs = await TimeTracking.aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: '$userDetails' },
        {
          $addFields: {
            calculatedDuration: {
              $cond: {
                if: { $eq: ["$isComplete", false] },
                then: {
                  $cond: {
                    if: { $eq: ["$isActive", true] },
                    then: {
                      $subtract: [
                        "$$NOW",
                        {
                          $cond: {
                            if: { $eq: ["$isPaused", true] },
                            then: { $last: "$pausePeriods.startTime" },
                            else: "$startTime"
                          }
                        }
                      ]
                    },
                    else: "$duration"
                  }
                },
                else: {
                  $subtract: [
                    "$endTime",
                    {
                      $add: [
                        "$startTime",
                        "$totalPausedTime"
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            user: 1,
            employeeName: '$userDetails.name',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            day: { $dayOfMonth: '$startTime' },
            duration: {
              $cond: {
                if: { $lt: ["$calculatedDuration", 0] },
                then: 0,
                else: "$calculatedDuration"
              }
            }
          }
        },
        {
          $group: {
            _id: {
              user: '$user',
              employeeName: '$employeeName',
              day: '$day'
            },
            totalHours: {
              $sum: { $divide: ['$duration', 3600000] }
            }
          }
        },
        {
          $group: {
            _id: {
              user: '$_id.user',
              employeeName: '$_id.employeeName'
            },
            dailyHours: {
              $push: {
                day: '$_id.day',
                hours: { $round: ['$totalHours', 2] }
              }
            },
            totalMonthHours: { $sum: { $round: ['$totalHours', 2] } }
          }
        },
        {
          $project: {
            _id: 0,
            userId: '$_id.user',
            employeeName: '$_id.employeeName',
            dailyHours: 1,
            totalMonthHours: { $round: ['$totalMonthHours', 2] }
          }
        },
        { $sort: { totalMonthHours: -1 } }
      ]);

      // Format the response to include all days of the month
      const formattedResponse = employeeLogs.map(employee => {
        const dailyHoursMap = {};

        // Initialize all days with 0 hours
        daysArray.forEach(day => {
          dailyHoursMap[day] = 0;
        });

        // Fill in actual hours logged
        employee.dailyHours.forEach(entry => {
          dailyHoursMap[entry.day] = entry.hours;
        });

        // Convert map to array format
        const dailyHoursArray = Object.entries(dailyHoursMap).map(([day, hours]) => ({
          day: parseInt(day),
          hours
        }));

        return {
          userId: employee.userId,
          employeeName: employee.employeeName,
          dailyHours: dailyHoursArray.sort((a, b) => a.day - b.day),
          totalMonthHours: employee.totalMonthHours
        };
      });

      res.status(200).json({
        status: 200,
        message: 'Monthly employee summary retrieved successfully',
        month: month,
        daysInMonth,
        data: formattedResponse
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error retrieving monthly employee summary',
        error: error.message
      });
    }
  }

  /**
   * Project View: Daily Summary
   * @param {Object} req - Request object with filters
   * @param {Object} res - Response object
   */
  async getProjectDailySummary(req, res) {
    try {
      const { dateFrom, dateTo, month, projectType } = req.query;

      let startDate, endDate;

      if (month) {
        // Parse month (format: YYYY-MM)
        const [year, monthNum] = month.split('-');
        startDate = new Date(year, monthNum - 1, 1);
        endDate = new Date(year, monthNum, 0); // Last day of month
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFrom && dateTo) {
        startDate = new Date(dateFrom);
        endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        return res.status(400).json({
          status: 400,
          message: 'Either month or date range is required'
        });
      }


      // Generate array of all days in the date range

      const daysArray = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        daysArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      let matchQuery = {
        startTime: { $gte: startDate, $lte: endDate }
      }
      if (projectType && projectType.trim() !== '') matchQuery.projectType = projectType;

      const projectLogs = await TimeTracking.aggregate([
        {
          $match: matchQuery
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectDetails'
          }
        },
        { $unwind: '$projectDetails' },
        {
          $addFields: {
            currentEndTime: {
              $cond: {
                if: { $eq: ["$isActive", true] },
                then: "$$NOW",
                else: "$endTime"
              }
            },
            activePauseDuration: {
              $cond: {
                if: { $eq: ["$isPaused", true] },
                then: {
                  $subtract: ["$$NOW", { $last: "$pausePeriods.startTime" }]
                },
                else: 0
              }
            }
          }
        },
        {
          $addFields: {
            totalPauseTime: {
              $add: ["$totalPausedTime", "$activePauseDuration"]
            }
          }
        },
        {
          $project: {
            project: 1,
            projectName: '$projectDetails.name',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            totalLoggedTime: {
              $subtract: [
                { $toDate: '$currentEndTime' },
                { $add: [{ $toDate: '$startTime' }, '$totalPauseTime'] }
              ]
            }
          }
        },
        {
          $group: {
            _id: {
              project: '$project',
              projectName: '$projectName',
              date: '$date'
            },
            hoursLogged: {
              $sum: { $divide: ['$totalLoggedTime', 3600000] }
            }
          }
        },
        {
          $group: {
            _id: {
              project: '$_id.project',
              projectName: '$_id.projectName'
            },
            dailyHours: {
              $push: {
                date: '$_id.date',
                hours: { $round: ['$hoursLogged', 2] }
              }
            },
            totalHours: { $sum: { $round: ['$hoursLogged', 2] } }
          }
        },
        {
          $project: {
            _id: 0,
            projectId: '$_id.project',
            projectName: '$_id.projectName',
            dailyHours: 1,
            totalHours: { $round: ['$totalHours', 2] }
          }
        },
        { $sort: { projectName: 1 } }
      ]);

      // Format the response to include all days in the date range
      const formattedResponse = projectLogs.map(project => {
        const dailyHoursMap = {};

        // Initialize all days with 0 hours
        daysArray.forEach(day => {
          const dateStr = day.toISOString().split('T')[0];
          dailyHoursMap[dateStr] = 0;
        });

        // Fill in actual hours logged
        project.dailyHours.forEach(entry => {
          dailyHoursMap[entry.date] = entry.hours;
        });

        // Convert map to array format
        const dailyHoursArray = Object.entries(dailyHoursMap).map(([date, hours]) => ({
          date,
          hours
        }));

        return {
          projectId: project.projectId,
          projectName: project.projectName,
          dailyHours: dailyHoursArray.sort((a, b) => a.date.localeCompare(b.date)),
          totalHours: project.totalHours
        };
      });

      res.status(200).json({
        status: 200,
        message: 'Project daily summary retrieved successfully',
        dateRange: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        },
        data: formattedResponse
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error retrieving project daily summary',
        error: error.message
      });
    }
  }

  /**
   * Single Project Team View
   * @param {Object} req - Request object with filters
   * @param {Object} res - Response object
   */
  async getSingleProjectTeamView(req, res) {
    try {
      const { projectId, dateFrom, dateTo, projectType } = req.query;

      if (!projectId) {
        return res.status(400).json({
          status: 400,
          message: 'Project ID is required'
        });
      }

      // Default to last 30 days if no date range provided
      const endDate = dateTo ? new Date(dateTo) : new Date();
      endDate.setHours(23, 59, 59, 999);

      const startDate = dateFrom
        ? new Date(dateFrom)
        : new Date(endDate);
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0);

      // Generate array of all days in the date range
      const daysArray = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        daysArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      let matchQuery = {
        project: new mongoose.Types.ObjectId(projectId),
        startTime: { $gt: startDate, $lte: endDate }
      }
      if (projectType && projectType.trim() !== '') matchQuery.projectType = projectType;
      const projectTeamLogs = await TimeTracking.aggregate([
        {
          $match: matchQuery
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: '$userDetails' },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'projectDetails'
          }
        },
        { $unwind: '$projectDetails' },
        {
          $addFields: {
            currentEndTime: {
              $cond: {
                if: { $eq: ["$isActive", true] },
                then: "$$NOW",
                else: "$endTime"
              }
            },
            activePauseDuration: {
              $cond: {
                if: { $eq: ["$isPaused", true] },
                then: {
                  $subtract: ["$$NOW", { $last: "$pausePeriods.startTime" }]
                },
                else: 0
              }
            }
          }
        },
        {
          $addFields: {
            totalPauseTime: {
              $add: ["$totalPausedTime", "$activePauseDuration"]
            }
          }
        },
        {
          $project: {
            user: 1,
            employeeName: '$userDetails.name',
            projectName: '$projectDetails.name',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
            totalLoggedTime: {
              $subtract: [
                { $toDate: '$currentEndTime' },
                { $add: [{ $toDate: '$startTime' }, '$totalPauseTime'] }
              ]
            }
          }
        },
        {
          $group: {
            _id: {
              user: '$user',
              employeeName: '$employeeName',
              date: '$date'
            },
            hoursLogged: {
              $sum: { $divide: ['$totalLoggedTime', 3600000] }
            }
          }
        },
        {
          $group: {
            _id: {
              user: '$_id.user',
              employeeName: '$_id.employeeName'
            },
            dailyHours: {
              $push: {
                date: '$_id.date',
                hours: { $round: ['$hoursLogged', 2] }
              }
            },
            totalHours: { $sum: { $round: ['$hoursLogged', 2] } }
          }
        },
        {
          $project: {
            _id: 0,
            userId: '$_id.user',
            employeeName: '$_id.employeeName',
            dailyHours: 1,
            totalHours: { $round: ['$totalHours', 2] }
          }
        },
        { $sort: { employeeName: 1 } }
      ]);

      // Get project details
      const projectDetails = await mongoose.model('Project').findById(projectId).select('name');

      // Format the response to include all days in the date range
      const formattedResponse = projectTeamLogs.map(employee => {
        const dailyHoursMap = {};

        // Initialize all days with 0 hours
        daysArray.forEach(day => {
          const dateStr = day.toISOString().split('T')[0];
          dailyHoursMap[dateStr] = 0;
        });

        // Fill in actual hours logged
        employee.dailyHours.forEach(entry => {
          dailyHoursMap[entry.date] = entry.hours;
        });

        // Convert map to array format
        const dailyHoursArray = Object.entries(dailyHoursMap).map(([date, hours]) => ({
          date,
          hours
        }));

        return {
          userId: employee.userId,
          employeeName: employee.employeeName,
          dailyHours: dailyHoursArray.sort((a, b) => a.date.localeCompare(b.date)),
          totalHours: employee.totalHours
        };
      });

      res.status(200).json({
        status: 200,
        message: 'Project team view retrieved successfully',
        project: projectDetails || { _id: projectId, name: 'Unknown Project' },
        dateRange: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        },
        data: formattedResponse
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: 'Error retrieving project team view',
        error: error.message
      });
    }
  }
}

module.exports = new TimeTrackingReportsController();